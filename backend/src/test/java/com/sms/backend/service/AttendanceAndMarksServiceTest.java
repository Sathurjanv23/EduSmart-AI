package com.sms.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.sms.backend.dto.AttendanceDTO;
import com.sms.backend.dto.MarksRequest;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Attendance;
import com.sms.backend.model.Student;
import com.sms.backend.repository.AttendanceRepository;
import com.sms.backend.repository.ExamRepository;
import com.sms.backend.repository.MarksRepository;
import com.sms.backend.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
class AttendanceAndMarksServiceTest {
    @Mock AttendanceRepository attendanceRepository;
    @Mock MarksRepository marksRepository;
    @Mock ExamRepository examRepository;
    @Mock StudentRepository studentRepository;
    @InjectMocks AttendanceService attendanceService;
    @InjectMocks MarksService marksService;

    @Test
    void duplicateAttendanceIsUpdatedInsteadOfInserted() {
        Student student = student();
        Attendance existing = new Attendance();
        existing.setId("attendance-1");
        AttendanceDTO request = new AttendanceDTO("student-1", "GRADE-10-A", LocalDate.now(), "ABSENT");
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(student));
        when(attendanceRepository.findByStudentIdAndClassIdAndAttendanceDate(
                "student-1", "GRADE-10-A", LocalDate.now())).thenReturn(Optional.of(existing));
        when(attendanceRepository.save(existing)).thenReturn(existing);

        Attendance result = attendanceService.markAttendance(request, "teacher@example.test");

        assertEquals("attendance-1", result.getId());
        assertEquals("ABSENT", result.getStatus());
        verify(attendanceRepository).save(same(existing));
    }

    @Test
    void marksCannotExceedTotal() {
        MarksRequest request = new MarksRequest("student-1", "Mathematics", 101, 100, null);
        assertThrows(ApiException.class, () -> marksService.addMarks(request, "teacher@example.test"));
    }

    private Student student() {
        Student student = new Student();
        student.setId("student-1");
        student.setName("Synthetic Student");
        student.setStudentClass("GRADE-10-A");
        return student;
    }
}
