package com.sms.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "attendance")
public class Attendance {

    @Id
    private String id;

    private String studentId;
    private String classId;
    private LocalDate attendanceDate;
    private String studentName;
    private String parentEmail;
    private String date;
    private String status;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String remark;

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
}