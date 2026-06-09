package com.cc91.dto;

import com.cc91.entity.Report;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 创建举报请求 DTO
 */
public class CreateReportRequest {

    @NotNull(message = "举报目标类型不能为空")
    private Report.TargetType targetType;

    @NotNull(message = "举报目标ID不能为空")
    private Long targetId;

    @NotBlank(message = "举报原因不能为空")
    @Size(min = 1, max = 500, message = "举报原因长度应在1-500个字符之间")
    private String reason;

    public CreateReportRequest() {}

    public CreateReportRequest(Report.TargetType targetType, Long targetId, String reason) {
        this.targetType = targetType;
        this.targetId = targetId;
        this.reason = reason;
    }

    // Getters and Setters
    public Report.TargetType getTargetType() { return targetType; }
    public void setTargetType(Report.TargetType targetType) { this.targetType = targetType; }

    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
