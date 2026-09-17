package com.sms.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.AttendanceDTO;
import com.sms.backend.model.Attendance;
import com.sms.backend.model.Student;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.AttendanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    private final AttendanceService attendanceService;
    private final AcademicAccessService accessService;

    public AttendanceController(AttendanceService attendanceService, AcademicAccessService accessService) {
        this.attendanceService = attendanceService;
        this.accessService = accessService;
    }

    @PostMapping({"", "/mark"})
    public Attendance markAttendance(
            @Valid @RequestBody AttendanceDTO attendance,
            Authentication authentication) {
        accessService.requireTeacherClass(authentication, attendance.getClassId());
        return attendanceService.markAttendance(attendance, authentication.getName());
    }

    @GetMapping
    public List<Attendance> getAllAttendance(Authentication authentication) {
        accessService.requireAdmin(authentication);
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/me")
    public List<Attendance> getMyAttendance(Authentication authentication) {
        Student student = accessService.currentStudent(authentication);
        return attendanceService.getAttendanceByStudentId(student.getId());
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getAttendanceByStudentId(
            @PathVariable String studentId,
            Authentication authentication) {
        accessService.requireStudentAccess(authentication, studentId);
        return attendanceService.getAttendanceByStudentId(studentId);
    }

    @GetMapping("/class/{classId}/date/{attendanceDate}")
    public List<Attendance> getAttendanceByClassAndDate(
            @PathVariable String classId,
            @PathVariable LocalDate attendanceDate,
            Authentication authentication) {
        accessService.requireTeacherClass(authentication, classId);
        return attendanceService.getAttendanceByClassAndDate(classId, attendanceDate);
    }

    @GetMapping("/qr/{classId}/date/{attendanceDate}")
    public Map<String, String> generateAttendanceQrCode(
            @PathVariable String classId,
            @PathVariable LocalDate attendanceDate,
            Authentication authentication) {
        accessService.requireTeacherClass(authentication, classId);
        return Map.of("qrCode", attendanceService.generateAttendanceQrCode(classId, attendanceDate));
    }
}
