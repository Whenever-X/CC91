package com.cc91.controller;

import com.cc91.dto.ApiResponse;
import com.cc91.dto.CreateReportRequest;
import com.cc91.entity.Report;
import com.cc91.exception.UnauthorizedException;
import com.cc91.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 举报控制器
 * 处理举报相关的请求
 */
@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * 用户提交举报
     * POST /api/reports
     */
    @PostMapping("/reports")
    public ResponseEntity<ApiResponse<Report>> createReport(
            @Valid @RequestBody CreateReportRequest request) {
        String username = getCurrentUsername();
        Report report = reportService.createReport(
                username,
                request.getContentId(),
                request.getContentType(),
                request.getReason(),
                request.getDescription()
        );
        return ResponseEntity.ok(ApiResponse.success("举报提交成功", report));
    }

    /**
     * 管理员获取举报列表
     * GET /api/admin/reports
     */
    @GetMapping("/admin/reports")
    public ResponseEntity<Page<Report>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(reportService.getReports(status, page, size));
    }

    /**
     * 管理员处理举报
     * PUT /api/admin/reports/{id}
     */
    @PutMapping("/admin/reports/{id}")
    public ResponseEntity<ApiResponse<Report>> handleReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Report report = reportService.handleReport(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("举报已处理", report));
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        throw new UnauthorizedException("用户未登录");
    }
}
