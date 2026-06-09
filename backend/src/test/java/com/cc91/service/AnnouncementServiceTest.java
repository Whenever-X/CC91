package com.cc91.service;

import com.cc91.dto.AnnouncementDTO;
import com.cc91.dto.CreateAnnouncementRequest;
import com.cc91.dto.UpdateAnnouncementRequest;
import com.cc91.entity.Announcement;
import com.cc91.entity.User;
import com.cc91.exception.ResourceNotFoundException;
import com.cc91.repository.AnnouncementRepository;
import com.cc91.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * AnnouncementService 业务逻辑测试
 */
@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AnnouncementServiceTest {

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EntityManager entityManager;

    private Long adminId;
    private String adminUsername = "admin";

    @BeforeEach
    void cleanDatabase() {
        announcementRepository.deleteAll();
        userRepository.deleteAll();

        User admin = new User(adminUsername, "admin@example.com", passwordEncoder.encode("password123"));
        admin.setRole("ADMIN");
        admin = userRepository.save(admin);
        adminId = admin.getId();
    }

    // ==================== findAll 方法测试 ====================

    @Test
    @Transactional
    void findAll_ReturnsListWithPinnedFirst() {
        // Arrange: 创建两个公告，一个不置顶，一个置顶
        Announcement a1 = new Announcement("普通公告", "内容1", adminId);
        a1.setIsPinned(false);
        announcementRepository.save(a1);

        Announcement a2 = new Announcement("置顶公告", "内容2", adminId);
        a2.setIsPinned(true);
        announcementRepository.save(a2);

        // Act
        List<AnnouncementDTO> result = announcementService.findAll();

        // Assert: 置顶在前
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("置顶公告", result.get(0).getTitle());
        assertTrue(result.get(0).getIsPinned());
        assertEquals("普通公告", result.get(1).getTitle());
        assertFalse(result.get(1).getIsPinned());
    }

    @Test
    void findAll_Empty_ReturnsEmptyList() {
        List<AnnouncementDTO> result = announcementService.findAll();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    // ==================== findById 方法测试 ====================

    @Test
    @Transactional
    void findById_ExistingId_ReturnsAnnouncement() {
        // Arrange
        Announcement a = new Announcement("测试公告", "测试内容", adminId);
        a = announcementRepository.save(a);
        entityManager.flush();
        entityManager.clear();

        // Act
        AnnouncementDTO result = announcementService.findById(a.getId());

        // Assert
        assertNotNull(result);
        assertEquals(a.getId(), result.getId());
        assertEquals("测试公告", result.getTitle());
        assertEquals("测试内容", result.getContent());
        assertEquals(adminId, result.getAuthorId());
        assertEquals(adminUsername, result.getAuthorUsername());
    }

    @Test
    void findById_NonExistentId_ThrowsResourceNotFoundException() {
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> announcementService.findById(999L)
        );
        assertEquals("公告不存在", exception.getMessage());
    }

    // ==================== create 方法测试 ====================

    @Test
    @Transactional
    void create_ValidRequest_CreatesAnnouncement() {
        // Arrange
        CreateAnnouncementRequest request = new CreateAnnouncementRequest("新公告", "公告内容", true);

        // Act
        AnnouncementDTO result = announcementService.create(request, adminUsername);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("新公告", result.getTitle());
        assertEquals("公告内容", result.getContent());
        assertEquals(adminId, result.getAuthorId());
        assertTrue(result.getIsPinned());
        assertNotNull(result.getCreatedAt());

        // Assert: 数据库中已保存
        Announcement saved = announcementRepository.findById(result.getId()).orElse(null);
        assertNotNull(saved);
        assertEquals("新公告", saved.getTitle());
    }

    @Test
    void create_UserNotExists_ThrowsResourceNotFoundException() {
        CreateAnnouncementRequest request = new CreateAnnouncementRequest("标题", "内容", false);

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> announcementService.create(request, "nonexistent")
        );
        assertEquals("用户不存在", exception.getMessage());
    }

    // ==================== update 方法测试 ====================

    @Test
    @Transactional
    void update_ValidRequest_UpdatesAnnouncement() {
        // Arrange
        Announcement a = new Announcement("旧标题", "旧内容", adminId);
        a.setIsPinned(false);
        a = announcementRepository.save(a);
        Long aId = a.getId();
        entityManager.flush();
        entityManager.clear();

        UpdateAnnouncementRequest request = new UpdateAnnouncementRequest();
        request.setTitle("新标题");
        request.setContent("新内容");
        request.setIsPinned(true);

        // Act
        AnnouncementDTO result = announcementService.update(aId, request);

        // Assert
        assertNotNull(result);
        assertEquals(aId, result.getId());
        assertEquals("新标题", result.getTitle());
        assertEquals("新内容", result.getContent());
        assertTrue(result.getIsPinned());

        // Assert: 数据库中已更新
        entityManager.flush();
        entityManager.clear();
        Announcement updated = announcementRepository.findById(aId).orElse(null);
        assertNotNull(updated);
        assertEquals("新标题", updated.getTitle());
        assertTrue(updated.getIsPinned());
    }

    @Test
    @Transactional
    void update_OnlyPartialFields_UpdatesOnlyProvidedFields() {
        // Arrange
        Announcement a = new Announcement("旧标题", "旧内容", adminId);
        a = announcementRepository.save(a);
        Long aId = a.getId();
        entityManager.flush();
        entityManager.clear();

        UpdateAnnouncementRequest request = new UpdateAnnouncementRequest();
        request.setTitle("新标题");
        // content is null -> should not be updated

        // Act
        AnnouncementDTO result = announcementService.update(aId, request);

        // Assert: only title changed
        assertEquals("新标题", result.getTitle());
        assertEquals("旧内容", result.getContent());
    }

    @Test
    void update_NonExistentId_ThrowsResourceNotFoundException() {
        UpdateAnnouncementRequest request = new UpdateAnnouncementRequest();
        request.setTitle("新标题");

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> announcementService.update(999L, request)
        );
        assertEquals("公告不存在", exception.getMessage());
    }

    // ==================== delete 方法测试 ====================

    @Test
    @Transactional
    void delete_ExistingId_DeletesAnnouncement() {
        // Arrange
        Announcement a = new Announcement("待删除", "内容", adminId);
        a = announcementRepository.save(a);
        Long id = a.getId();

        // Act
        announcementService.delete(id);

        // Assert: 数据库中已删除
        assertFalse(announcementRepository.findById(id).isPresent());
    }

    @Test
    void delete_NonExistentId_ThrowsResourceNotFoundException() {
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> announcementService.delete(999L)
        );
        assertEquals("公告不存在", exception.getMessage());
    }
}
