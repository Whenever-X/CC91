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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private static final long MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

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

    /**
     * 通用图片上传
     * POST /api/upload/images
     */
    @PostMapping("/images")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        getCurrentUsername(); // 验证已登录

        // 校验文件类型
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("仅支持 jpg/png/gif/webp 格式图片");
        }

        // 校验文件大小（2MB）
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("文件大小不能超过 2MB");
        }

        // 生成文件名
        String originalFilename = file.getOriginalFilename();
        String ext = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".png";
        String filename = UUID.randomUUID().toString() + ext;

        // 保存到 uploads/images/
        Path uploadDir = Path.of("uploads/images");
        Files.createDirectories(uploadDir);
        Path filePath = uploadDir.resolve(filename);
        file.transferTo(filePath.toFile());

        String url = "/uploads/images/" + filename;
        return ResponseEntity.ok(ApiResponse.success("上传成功", Map.of("url", url)));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new UnauthorizedException("用户未登录");
    }
}
