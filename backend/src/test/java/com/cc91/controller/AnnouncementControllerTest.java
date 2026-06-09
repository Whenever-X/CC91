package com.cc91.controller;

import com.cc91.entity.Announcement;
import com.cc91.entity.User;
import com.cc91.repository.AnnouncementRepository;
import com.cc91.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AnnouncementController HTTP endpoint tests
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AnnouncementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long adminId;

    @BeforeEach
    void cleanDatabase() {
        announcementRepository.deleteAll();
        userRepository.deleteAll();

        User admin = new User("admin", "admin@example.com", passwordEncoder.encode("password123"));
        admin.setRole("ADMIN");
        admin = userRepository.save(admin);
        adminId = admin.getId();
    }

    // ==================== GET /api/announcements (公开) ====================

    @Test
    @Transactional
    void listAll_ReturnsAllAnnouncements() throws Exception {
        // Arrange
        Announcement a1 = new Announcement("公告1", "内容1", adminId);
        a1.setIsPinned(false);
        announcementRepository.save(a1);

        Announcement a2 = new Announcement("公告2", "内容2", adminId);
        a2.setIsPinned(true);
        announcementRepository.save(a2);

        // Act & Assert: pinned first
        mockMvc.perform(get("/api/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("公告2")) // pinned first
                .andExpect(jsonPath("$[1].title").value("公告1"));
    }

    @Test
    void listAll_Empty_ReturnsEmptyArray() throws Exception {
        mockMvc.perform(get("/api/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ==================== GET /api/announcements/{id} (公开) ====================

    @Test
    @Transactional
    void getDetail_ExistingId_ReturnsAnnouncement() throws Exception {
        // Arrange
        Announcement a = new Announcement("测试公告", "测试内容", adminId);
        a = announcementRepository.save(a);

        // Act & Assert
        mockMvc.perform(get("/api/announcements/" + a.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(a.getId()))
                .andExpect(jsonPath("$.title").value("测试公告"))
                .andExpect(jsonPath("$.content").value("测试内容"))
                .andExpect(jsonPath("$.authorId").value(adminId));
    }

    @Test
    void getDetail_NonExistentId_Returns404() throws Exception {
        mockMvc.perform(get("/api/announcements/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("公告不存在"));
    }

    // ==================== POST /api/admin/announcements (需 ADMIN 角色) ====================

    @Test
    @WithMockUser(roles = "ADMIN", username = "admin")
    @Transactional
    void create_ValidRequest_Returns200() throws Exception {
        String requestBody = """
            {
                "title": "新公告",
                "content": "公告内容",
                "isPinned": true
            }
            """;

        mockMvc.perform(post("/api/admin/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("公告创建成功"))
                .andExpect(jsonPath("$.data.title").value("新公告"))
                .andExpect(jsonPath("$.data.content").value("公告内容"))
                .andExpect(jsonPath("$.data.isPinned").value(true))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.createdAt").exists());
    }

    @Test
    void create_NoAuth_Returns401() throws Exception {
        String requestBody = """
            {
                "title": "新公告",
                "content": "公告内容"
            }
            """;

        mockMvc.perform(post("/api/admin/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER", username = "admin")
    void create_NonAdminRole_Returns403() throws Exception {
        String requestBody = """
            {
                "title": "新公告",
                "content": "公告内容"
            }
            """;

        mockMvc.perform(post("/api/admin/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isForbidden());
    }

    // ==================== PUT /api/admin/announcements/{id} (需 ADMIN) ====================

    @Test
    @WithMockUser(roles = "ADMIN", username = "admin")
    @Transactional
    void update_ValidRequest_Returns200() throws Exception {
        // Arrange
        Announcement a = new Announcement("旧标题", "旧内容", adminId);
        a = announcementRepository.save(a);

        String requestBody = """
            {
                "title": "新标题",
                "content": "新内容"
            }
            """;

        // Act & Assert
        mockMvc.perform(put("/api/admin/announcements/" + a.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("公告更新成功"))
                .andExpect(jsonPath("$.data.title").value("新标题"))
                .andExpect(jsonPath("$.data.content").value("新内容"));
    }

    @Test
    @WithMockUser(roles = "ADMIN", username = "admin")
    void update_NonExistentId_Returns404() throws Exception {
        String requestBody = """
            {
                "title": "新标题"
            }
            """;

        mockMvc.perform(put("/api/admin/announcements/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("公告不存在"));
    }

    @Test
    void update_NoAuth_Returns401() throws Exception {
        String requestBody = """
            {
                "title": "新标题"
            }
            """;

        mockMvc.perform(put("/api/admin/announcements/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isUnauthorized());
    }

    // ==================== DELETE /api/admin/announcements/{id} (需 ADMIN) ====================

    @Test
    @WithMockUser(roles = "ADMIN", username = "admin")
    @Transactional
    void delete_ExistingId_Returns200() throws Exception {
        // Arrange
        Announcement a = new Announcement("待删除", "内容", adminId);
        a = announcementRepository.save(a);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/announcements/" + a.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("公告删除成功"));
    }

    @Test
    @WithMockUser(roles = "ADMIN", username = "admin")
    void delete_NonExistentId_Returns404() throws Exception {
        mockMvc.perform(delete("/api/admin/announcements/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("公告不存在"));
    }

    @Test
    void delete_NoAuth_Returns401() throws Exception {
        mockMvc.perform(delete("/api/admin/announcements/1"))
                .andExpect(status().isUnauthorized());
    }
}
