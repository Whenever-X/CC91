package com.cc91.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 更新公告请求 DTO
 */
public class UpdateAnnouncementRequest {

    @NotBlank(message = "公告标题不能为空")
    @Size(max = 200, message = "公告标题最多200个字符")
    private String title;

    @NotBlank(message = "公告内容不能为空")
    private String content;

    private Boolean isPinned;

    public UpdateAnnouncementRequest() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getIsPinned() { return isPinned; }
    public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }
}
