package com.sms.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AnnouncementDTO {
    private String id;
    @NotBlank @Size(max = 160)
    private String title;
    @NotBlank @Size(max = 10000)
    private String content;
    @NotEmpty @Size(max = 4)
    private List<@Pattern(regexp = "ADMIN|TEACHER|STUDENT|PARENT") String> visibleTo;
    @Pattern(regexp = "LOW|NORMAL|HIGH|URGENT")
    private String priority;
    @Size(max = 80)
    private String category;
    @Size(max = 500)
    private String attachmentUrl;
    private LocalDateTime publishedAt;
    @Future
    private LocalDateTime expiresAt;

    public AnnouncementDTO() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getVisibleTo() {
        return visibleTo;
    }

    public void setVisibleTo(List<String> visibleTo) {
        this.visibleTo = visibleTo;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
