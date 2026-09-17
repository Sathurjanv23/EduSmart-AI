package com.sms.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sms.backend.dto.AttendanceDTO;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Attendance;
import com.sms.backend.model.Student;
import com.sms.backend.repository.AttendanceRepository;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.util.QRCodeUtil;

@Service
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    public Attendance markAttendance(AttendanceDTO dto, String recordedBy) {
        if (dto.getAttendanceDate().isAfter(LocalDate.now())) {
            throw ApiException.badRequest("INVALID_ATTENDANCE_DATE", "Attendance cannot be recorded for a future date");
        }
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> ApiException.notFound("Student"));
        if (!dto.getClassId().equals(student.getStudentClass())) {
            throw ApiException.badRequest("CLASS_MISMATCH", "Student is not enrolled in the selected class");
        }

        LocalDateTime now = LocalDateTime.now();
        Attendance attendance = attendanceRepository.findByStudentIdAndClassIdAndAttendanceDate(
                dto.getStudentId(), dto.getClassId(), dto.getAttendanceDate()).orElseGet(() -> {
                    Attendance created = new Attendance();
                    created.setCreatedAt(now);
                    return created;
                });
        attendance.setStudentId(student.getId());
        attendance.setClassId(dto.getClassId());
        attendance.setAttendanceDate(dto.getAttendanceDate());
        attendance.setDate(dto.getAttendanceDate().toString());
        attendance.setStudentName(student.getName());
        attendance.setParentEmail(student.getParentEmail());
        attendance.setStatus(dto.getStatus());
        attendance.setCheckOutTime(dto.getCheckOutTime());
        attendance.setRemark(dto.getRemark() == null ? null : dto.getRemark().trim());
        attendance.setRecordedBy(recordedBy);
        attendance.setUpdatedAt(now);
        if (attendance.getCheckInTime() == null
                && ("PRESENT".equals(dto.getStatus()) || "LATE".equals(dto.getStatus()))) {
            attendance.setCheckInTime(dto.getCheckInTime() == null ? now : dto.getCheckInTime());
        } else if (dto.getCheckInTime() != null) {
            attendance.setCheckInTime(dto.getCheckInTime());
        }
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> getAttendanceByStudentId(String studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getAttendanceByClassAndDate(String classId, LocalDate attendanceDate) {
        List<Attendance> existing = attendanceRepository.findByClassIdAndAttendanceDate(classId, attendanceDate);
        if (!existing.isEmpty()) {
            return existing;
        }
        return studentRepository.findByStudentClass(classId).stream().map(student -> {
            Attendance attendance = new Attendance();
            attendance.setStudentId(student.getId());
            attendance.setClassId(classId);
            attendance.setAttendanceDate(attendanceDate);
            attendance.setDate(attendanceDate.toString());
            attendance.setStudentName(student.getName());
            attendance.setParentEmail(student.getParentEmail());
            attendance.setStatus("PENDING");
            return attendance;
        }).toList();
    }

    public String generateAttendanceQrCode(String classId, LocalDate attendanceDate) {
        return QRCodeUtil.generateQRCodeForAttendance(classId, attendanceDate.toString());
    }
}
