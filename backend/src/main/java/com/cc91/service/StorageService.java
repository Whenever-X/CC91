package com.cc91.service;

import com.cc91.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;

@Service
public class StorageService {

    private static final Logger logger = LoggerFactory.getLogger(StorageService.class);

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    @Value("${app.upload.avatar-dir:uploads/avatars}")
    private String avatarDir;

    @Value("${app.upload.max-size:2097152}")
    private long maxFileSize;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Path.of(avatarDir));
        } catch (IOException e) {
            logger.warn("Could not create avatar upload directory: {}", e.getMessage());
        }
    }

    public String store(MultipartFile file, Long userId) {
        if (file.isEmpty()) {
            throw new BadRequestException("上传文件不能为空");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("仅支持 JPG、PNG、WebP 格式的图片");
        }

        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("文件大小不能超过 2MB");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = extractExtension(originalFilename);
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException("不支持的文件扩展名");
        }

        String filename = userId + "_" + System.currentTimeMillis() + "." + extension.toLowerCase();
        Path targetPath = Path.of(avatarDir, filename);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("文件存储失败", e);
        }

        logger.info("Avatar stored: {} for userId={}", filename, userId);
        return "/uploads/avatars/" + filename;
    }

    public void delete(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/avatars/")) {
            return;
        }
        String filename = fileUrl.substring("/uploads/avatars/".length());
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            logger.warn("Rejected path traversal in avatar URL: {}", filename);
            return;
        }
        try {
            Path filePath = Path.of(avatarDir, filename).normalize();
            Path allowedDir = Path.of(avatarDir).toAbsolutePath().normalize();
            if (!filePath.toAbsolutePath().normalize().startsWith(allowedDir)) {
                logger.warn("Rejected path escape in avatar URL: {}", filename);
                return;
            }
            Files.deleteIfExists(filePath);
            logger.info("Deleted old avatar: {}", filename);
        } catch (IOException e) {
            logger.warn("Failed to delete old avatar {}: {}", filename, e.getMessage());
        }
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return null;
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
