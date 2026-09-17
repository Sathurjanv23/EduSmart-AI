package com.sms.backend.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AssignmentDTO {
    private String id;
    @NotBlank @Size(max = 150)
    private String title;
    @NotBlank @Size(max = 5000)
    private String description;
    @NotBlank @Size(max = 40)
    private String classId;
    @NotBlank @Size(max = 80)
    private String subject;
    @NotNull @Future
    private LocalDateTime dueDate;
    @NotNull @Min(1)
    private Integer maxMarks;
    @Size(max = 500)
    private String fileUrl;
    @Size(max = 500)
    private String attachmentUrl;
    private String status;

    public AssignmentDTO() {
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Integer maxMarks) {
        this.maxMarks = maxMarks;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
