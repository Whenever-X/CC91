package com.cc91.userservice.controller;

import com.cc91.userservice.dto.UserInfoDTO;
import com.cc91.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Internal API for inter-service user lookups.
 * These endpoints are not exposed to the public — they are used by other microservices.
 */
@RestController
@RequestMapping("/api/users/internal")
public class InternalUserController {

    private final UserService userService;

    public InternalUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserInfoDTO> getUserById(@PathVariable Long id) {
        UserInfoDTO userInfo = userService.getUserInfoById(id);
        return ResponseEntity.ok(userInfo);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserInfoDTO> getUserByUsername(@PathVariable String username) {
        UserInfoDTO userInfo = userService.getUserInfoByUsername(username);
        return ResponseEntity.ok(userInfo);
    }

    /**
     * Batch lookup: resolve multiple user IDs in a single call.
     * POST /api/users/internal/batch
     */
    @PostMapping("/batch")
    public ResponseEntity<List<UserInfoDTO>> getUsersByIds(@RequestBody List<Long> ids) {
        List<UserInfoDTO> users = ids.stream()
                .map(id -> {
                    try {
                        return userService.getUserInfoById(id);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(u -> u != null)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
