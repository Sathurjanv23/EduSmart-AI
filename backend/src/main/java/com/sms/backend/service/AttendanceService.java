package com.sms.backend.service;

import com.sms.backend.dto.AttendanceDTO;
import com.sms.backend.model.Attendance;
import com.sms.backend.model.Student;
import com.sms.backend.repository.AttendanceRepository;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.util.QRCodeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    public Attendance markAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public Attendance markAttendance(AttendanceDTO dto) {
        Objects.requireNonNull(dto, "attendance dto must not be null");
        Objects.requireNonNull(dto.getStudentId(), "studentId must not be null");
        Objects.requireNonNull(dto.getClassId(), "classId must not be null");
        Objects.requireNonNull(dto.getAttendanceDate(), "attendanceDate must not be null");

        Student student = studentRepository.findById(dto.getStudentId()).orElse(null);
        Optional<Attendance> existing = attendanceRepository.findByStudentIdAndClassIdAndAttendanceDate(
                dto.getStudentId(), dto.getClassId(), dto.getAttendanceDate());

        Attendance attendance = existing.orElseGet(Attendance::new);
        attendance.setStudentId(dto.getStudentId());
        attendance.setClassId(dto.getClassId());
        attendance.setAttendanceDate(dto.getAttendanceDate());
        attendance.setDate(dto.getAttendanceDate().toString());
        attendance.setStatus(dto.getStatus());
        attendance.setCheckOutTime(dto.getCheckOutTime());
        attendance.setRemark(dto.getRemark());

        if (student != null) {
            attendance.setStudentName(student.getName());
            attendance.setParentEmail(student.getParentEmail());
            if (attendance.getClassId() == null) {
                attendance.setClassId(student.getStudentClass());
            }
        }

        if (attendance.getCheckInTime() == null && "PRESENT".equalsIgnoreCase(dto.getStatus())) {
            attendance.setCheckInTime(LocalDateTime.now());
        }

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> getAttendanceByStudentId(String studentId) {
        Objects.requireNonNull(studentId, "studentId must not be null");
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getAttendanceByClassAndDate(String classId, LocalDate attendanceDate) {
        Objects.requireNonNull(classId, "classId must not be null");
        Objects.requireNonNull(attendanceDate, "attendanceDate must not be null");

        List<Attendance> attendanceList = attendanceRepository.findByClassIdAndAttendanceDate(classId, attendanceDate);
        if (!attendanceList.isEmpty()) {
            return attendanceList;
        }

        return studentRepository.findAll().stream()
                .filter(student -> classId.equals(student.getStudentClass()))
                .map(student -> {
                    Attendance attendance = new Attendance();
                    attendance.setStudentId(student.getId());
                    attendance.setClassId(classId);
                    attendance.setAttendanceDate(attendanceDate);
                    attendance.setDate(attendanceDate.toString());
                    attendance.setStudentName(student.getName());
                    attendance.setParentEmail(student.getParentEmail());
                    attendance.setStatus("PENDING");
                    return attendance;
                })
                .collect(Collectors.toList());
    }

    public String generateAttendanceQrCode(String classId, LocalDate attendanceDate) {
        Objects.requireNonNull(classId, "classId must not be null");
        Objects.requireNonNull(attendanceDate, "attendanceDate must not be null");
        return QRCodeUtil.generateQRCodeForAttendance(classId, attendanceDate.toString());
    }
}