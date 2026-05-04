package com.sms.backend.repository;

import com.sms.backend.model.Attendance;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    List<Attendance> findByStudentId(String studentId);

    List<Attendance> findByClassIdAndAttendanceDate(String classId, LocalDate attendanceDate);

    Optional<Attendance> findByStudentIdAndClassIdAndAttendanceDate(String studentId, String classId,
            LocalDate attendanceDate);
}