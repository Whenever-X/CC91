package com.cc91.service;

import com.cc91.entity.Report;
import com.cc91.entity.User;
import com.cc91.exception.ResourceNotFoundException;
import com.cc91.repository.ReportRepository;
import com.cc91.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ReportService 业务逻辑测试
 */
@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ReportServiceTest {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long userId;
    private String username = "reporter";

    @BeforeEach
    void cleanDatabase() {
        reportRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User(username, "reporter@example.com", passwordEncoder.encode("password123"));
        user = userRepository.save(user);
        userId = user.getId();
    }

    // ==================== createReport 方法测试 ====================

    @Test
    @Transactional
    void createReport_ValidRequest_CreatesReport() {
        // Act
        Report result = reportService.createReport(username, 1L, "POST", "垃圾广告", "详细描述");

        // Assert
        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals(userId, result.getReporterId());
        assertEquals(Report.TargetType.POST, result.getTargetType());
        assertEquals(1L, result.getTargetId());
        assertTrue(result.getReason().contains("垃圾广告"));
        assertTrue(result.getReason().contains("详细描述"));
        assertEquals(Report.ReportStatus.PENDING, result.getStatus());
        assertNotNull(result.getCreatedAt());

        // Assert: 数据库中已保存
        Report saved = reportRepository.findById(result.getId()).orElse(null);
        assertNotNull(saved);
        assertEquals("垃圾广告 | 详细描述", saved.getReason());
    }

    @Test
    @Transactional
    void createReport_NullDescription_OnlyUsesReason() {
        // Act
        Report result = reportService.createReport(username, 2L, "COMMENT", "不当言论", null);

        // Assert: reason does not contain " | "
        assertNotNull(result);
        assertEquals("不当言论", result.getReason());
        assertEquals(Report.TargetType.COMMENT, result.getTargetType());
    }

    @Test
    @Transactional
    void createReport_EmptyDescription_OnlyUsesReason() {
        // Act
        Report result = reportService.createReport(username, 2L, "COMMENT", "不当言论", "  ");

        // Assert
        assertNotNull(result);
        assertEquals("不当言论", result.getReason());
    }

    @Test
    void createReport_UserNotExists_ThrowsResourceNotFoundException() {
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> reportService.createReport("nonexistent", 1L, "POST", "原因", null)
        );
        assertEquals("用户不存在", exception.getMessage());
    }

    // ==================== getReports 方法测试 ====================

    @Test
    @Transactional
    void getReports_ByStatus_ReturnsFilteredReports() {
        // Arrange: 创建不同状态的举报
        Report r1 = new Report(userId, Report.TargetType.POST, 1L, "原因1");
        r1.setStatus(Report.ReportStatus.PENDING);
        reportRepository.save(r1);

        Report r2 = new Report(userId, Report.TargetType.POST, 2L, "原因2");
        r2.setStatus(Report.ReportStatus.RESOLVED);
        reportRepository.save(r2);

        // Act: 按 PENDING 状态筛选
        Page<Report> result = reportService.getReports("PENDING", 0, 10);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("原因1", result.getContent().get(0).getReason());
        assertEquals(Report.ReportStatus.PENDING, result.getContent().get(0).getStatus());
    }

    @Test
    @Transactional
    void getReports_AllStatus_ReturnsAllReports() {
        // Arrange
        Report r1 = new Report(userId, Report.TargetType.POST, 1L, "原因1");
        reportRepository.save(r1);

        Report r2 = new Report(userId, Report.TargetType.POST, 2L, "原因2");
        r2.setStatus(Report.ReportStatus.RESOLVED);
        reportRepository.save(r2);

        // Act: null status -> all
        Page<Report> result = reportService.getReports(null, 0, 10);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
    }

    @Test
    @Transactional
    void getReports_EmptyStatus_ReturnsAllReports() {
        // Arrange
        reportRepository.save(new Report(userId, Report.TargetType.POST, 1L, "原因"));

        // Act: empty string status -> all
        Page<Report> result = reportService.getReports("  ", 0, 10);

        // Assert
        assertEquals(1, result.getTotalElements());
    }

    // ==================== handleReport 方法测试 ====================

    @Test
    @Transactional
    void handleReport_ValidRequest_UpdatesStatus() {
        // Arrange
        Report r = new Report(userId, Report.TargetType.POST, 1L, "原因");
        r = reportRepository.save(r);

        // Act
        Report result = reportService.handleReport(r.getId(), "RESOLVED");

        // Assert
        assertNotNull(result);
        assertEquals(Report.ReportStatus.RESOLVED, result.getStatus());
        assertNotNull(result.getReviewedAt());

        // Assert: 数据库中已更新
        Report updated = reportRepository.findById(r.getId()).orElse(null);
        assertNotNull(updated);
        assertEquals(Report.ReportStatus.RESOLVED, updated.getStatus());
        assertNotNull(updated.getReviewedAt());
    }

    @Test
    void handleReport_NonExistentId_ThrowsResourceNotFoundException() {
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> reportService.handleReport(999L, "RESOLVED")
        );
        assertEquals("举报不存在", exception.getMessage());
    }

    @Test
    @Transactional
    void handleReport_SetReviewedStatus_UpdatesCorrectly() {
        // Arrange
        Report r = new Report(userId, Report.TargetType.COMMENT, 5L, "骚扰");
        r = reportRepository.save(r);

        // Act
        Report result = reportService.handleReport(r.getId(), "REVIEWED");

        // Assert
        assertEquals(Report.ReportStatus.REVIEWED, result.getStatus());
    }
}
