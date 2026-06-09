package com.cc91.service;

import com.cc91.entity.Report;
import com.cc91.entity.User;
import com.cc91.exception.ResourceNotFoundException;
import com.cc91.repository.ReportRepository;
import com.cc91.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 举报服务
 */
@Service
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    /**
     * 创建举报
     *
     * @param username    举报人用户名
     * @param targetId    被举报目标 ID
     * @param targetType  目标类型 (POST / COMMENT)
     * @param reason      举报原因
     * @param description 补充描述（拼接到 reason 中）
     * @return 保存后的 Report 实体
     */
    @Transactional
    public Report createReport(String username, Long targetId, String targetType, String reason, String description) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));

        Report.TargetType type = Report.TargetType.valueOf(targetType.toUpperCase());

        // 将 description 附加到 reason 后面，避免修改实体
        String fullReason = reason;
        if (description != null && !description.trim().isEmpty()) {
            fullReason = reason + " | " + description;
        }

        Report report = new Report(user.getId(), type, targetId, fullReason);
        report = reportRepository.save(report);

        logger.info("举报创建成功: id={}, reporter={}, targetType={}, targetId={}",
                report.getId(), username, targetType, targetId);

        return report;
    }

    /**
     * 管理员获取举报列表（按状态筛选，分页）
     *
     * @param status 举报状态（为空则查全部）
     * @param page   页码
     * @param size   每页条数
     * @return 分页举报列表
     */
    @Transactional(readOnly = true)
    public Page<Report> getReports(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (status == null || status.trim().isEmpty()) {
            return reportRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        Report.ReportStatus reportStatus = Report.ReportStatus.valueOf(status.toUpperCase());
        return reportRepository.findByStatusOrderByCreatedAtDesc(reportStatus, pageable);
    }

    /**
     * 管理员处理举报
     *
     * @param id     举报 ID
     * @param status 处理后状态 (RESOLVED / REVIEWED)
     * @return 更新后的 Report 实体
     */
    @Transactional
    public Report handleReport(Long id, String status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("举报不存在"));

        report.setStatus(Report.ReportStatus.valueOf(status.toUpperCase()));
        report.setReviewedAt(LocalDateTime.now());
        report = reportRepository.save(report);

        logger.info("举报处理完成: id={}, status={}", id, status);

        return report;
    }
}
