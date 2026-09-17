package com.sms.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ExamDTO {
    private String id;
    @NotBlank @Size(max = 160)
    private String title;
    @Size(max = 5000)
    private String description;
    @NotBlank @Size(max = 40)
    private String classId;
    @NotBlank @Size(max = 80)
    private String subject;
    @NotNull @Future
    private LocalDateTime startTime;
    @NotNull @Future
    private LocalDateTime endTime;
    @NotNull @Min(1)
    private Integer totalMarks;
    @NotNull @Min(0)
    private Integer passingMarks;
    @NotBlank @Pattern(regexp = "MCQ|ESSAY|MIXED")
    private String examType;
    private List<String> questionIds;
    private String status;

    public ExamDTO() {
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

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Integer getPassingMarks() {
        return passingMarks;
    }

    public void setPassingMarks(Integer passingMarks) {
        this.passingMarks = passingMarks;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public List<String> getQuestionIds() {
        return questionIds;
    }

    public void setQuestionIds(List<String> questionIds) {
        this.questionIds = questionIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
