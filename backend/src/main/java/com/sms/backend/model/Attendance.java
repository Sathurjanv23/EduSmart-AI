package com.sms.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "attendance")
@CompoundIndex(
        name = "student_class_date_unique",
        def = "{'studentId': 1, 'classId': 1, 'attendanceDate': 1}",
        unique = true)
public class Attendance {

    @Id
    private String id;

    @Indexed
    private String studentId;
    @Indexed
    private String classId;
    @Indexed
    private LocalDate attendanceDate;
    private String studentName;
    private String parentEmail;
    private String date;
    private String status;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String remark;
    private String recordedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Attendance() {
    }

    public Attendance(String id, String studentId, String classId, LocalDate attendanceDate, String studentName,
            String parentEmail, String date, String status) {
        this.id = id;
        this.studentId = studentId;
        this.classId = classId;
        this.attendanceDate = attendanceDate;
        this.studentName = studentName;
        this.parentEmail = parentEmail;
        this.date = date;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public String getStudentId() {
        return studentId;
    }

    public String getClassId() {
        return classId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getParentEmail() {
        return parentEmail;
    }

    public String getDate() {
        return date;
    }

    public String getStatus() {
        return status;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setParentEmail(String parentEmail) {
        this.parentEmail = parentEmail;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalDateTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalDateTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
