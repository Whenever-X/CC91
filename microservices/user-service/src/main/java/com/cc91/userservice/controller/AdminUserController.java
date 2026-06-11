package com.cc91.userservice.controller;

import com.cc91.userservice.dto.AdminUserDTO;
import com.cc91.userservice.dto.ApiResponse;
import com.cc91.userservice.dto.UpdateUserRoleRequest;
import com.cc91.userservice.entity.User;
import com.cc91.userservice.exception.BadRequestException;
import com.cc91.userservice.exception.ResourceNotFoundException;
import com.cc91.userservice.repository.UserRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserController.class);
    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        List<AdminUserDTO> userDTOs = userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream().map(this::toDTO).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @PutMapping("/{id}/ban")
    public ResponseEntity<ApiResponse<Void>> banUser(@PathVariable Long id) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        if (user.getUsername().equals(currentUsername)) {
            throw new BadRequestException("不能封禁自己");
        }
        user.setIsLocked(true);
        user.setLockUntil(null);
        userRepository.save(user);
        logger.info("管理员封禁用户: id={}, username={}", id, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("用户已封禁"));
    }

    @PutMapping("/{id}/unban")
    public ResponseEntity<ApiResponse<Void>> unbanUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        user.setIsLocked(false);
        user.setLockUntil(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        logger.info("管理员解封用户: id={}, username={}", id, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success("用户已解封"));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
        user.setRole(request.getRole());
        userRepository.save(user);
        logger.info("管理员修改用户角色: userId={}, newRole={}", id, request.getRole());
        return ResponseEntity.ok(ApiResponse.success("用户角色已更新为 " + request.getRole()));
    }

    private AdminUserDTO toDTO(User user) {
        return new AdminUserDTO(
                user.getId(), user.getUsername(), user.getEmail(), user.getRole(),
                user.getIsLocked(), user.getCreatedAt(), user.getLockUntil()
        );
    }
}
