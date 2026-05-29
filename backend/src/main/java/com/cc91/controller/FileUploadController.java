package com.cc91.controller;

import com.cc91.dto.ApiResponse;
import com.cc91.dto.UserProfileDTO;
import com.cc91.exception.UnauthorizedException;
import com.cc91.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final UserService userService;

    public FileUploadController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) {
        String username = getCurrentUsername();
        UserProfileDTO updated = userService.uploadAvatar(username, file);
        return ResponseEntity.ok(ApiResponse.success("头像上传成功",
                Map.of("avatarUrl", updated.getAvatarUrl())));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new UnauthorizedException("用户未登录");
    }
}
