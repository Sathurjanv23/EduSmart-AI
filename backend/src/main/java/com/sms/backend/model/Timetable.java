package com.sms.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "timetables")
public class Timetable {
    @Id
    private String id;
    private String classId;
    private String academicYear;
    private String day;
    private List<Period> periods;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status; // DRAFT, ACTIVE, ARCHIVED

    public static class Period {
        public String periodNumber;
        public String subjectId;
        public String teacherId;
        public String startTime;
        public String endTime;
        public String room;

        public Period() {
        }

        public Period(String periodNumber, String subjectId, String teacherId, String startTime, String endTime,
                String room) {
            this.periodNumber = periodNumber;
            this.subjectId = subjectId;
            this.teacherId = teacherId;
            this.startTime = startTime;
            this.endTime = endTime;
            this.room = room;
        }
    }

    public Timetable() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public List<Period> getPeriods() {
        return periods;
    }

    public void setPeriods(List<Period> periods) {
        this.periods = periods;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
