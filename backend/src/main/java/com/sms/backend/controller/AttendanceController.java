package com.sms.backend.controller;

import com.sms.backend.dto.AttendanceDTO;
import com.sms.backend.model.Attendance;
import com.sms.backend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping
    public Attendance markAttendance(@RequestBody Attendance attendance) {
        return attendanceService.markAttendance(attendance);
    }

    @PostMapping("/mark")
    public Attendance markAttendanceForClass(@RequestBody AttendanceDTO attendanceDTO) {
        return attendanceService.markAttendance(attendanceDTO);
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getAttendanceByStudentId(@PathVariable String studentId) {
        return attendanceService.getAttendanceByStudentId(studentId);
    }

    @GetMapping("/class/{classId}/date/{attendanceDate}")
    public List<Attendance> getAttendanceByClassAndDate(
            @PathVariable String classId,
            @PathVariable LocalDate attendanceDate) {
        return attendanceService.getAttendanceByClassAndDate(classId, attendanceDate);
    }

    @GetMapping("/qr/{classId}/date/{attendanceDate}")
    public String generateAttendanceQrCode(
            @PathVariable String classId,
            @PathVariable LocalDate attendanceDate) {
        return attendanceService.generateAttendanceQrCode(classId, attendanceDate);
    }
}
