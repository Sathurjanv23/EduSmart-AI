package com.sms.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AttendanceDTO {
    private String id;
    @NotBlank(message = "Student ID is required")
    @Size(max = 100)
    private String studentId;
    @NotBlank(message = "Class ID is required")
    @Size(max = 40)
    private String classId;
    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;
    @NotBlank(message = "Attendance status is required")
    @Pattern(regexp = "PRESENT|ABSENT|LATE|EXCUSED", message = "Unsupported attendance status")
    private String status;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    @Size(max = 500)
    private String remark;

    public AttendanceDTO() {
    }

    public AttendanceDTO(String studentId, String classId, LocalDate attendanceDate, String status) {
        this.studentId = studentId;
        this.classId = classId;
        this.attendanceDate = attendanceDate;
        this.status = status;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getClassId() {
        return classId;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getStatus() {
        return status;
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
