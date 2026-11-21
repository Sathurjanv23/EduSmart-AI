package com.sms.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
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
import com.sms.backend.model.Exam;
import com.sms.backend.model.Marks;
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

    @Test
    void marksCannotBeNegative() {
        MarksRequest request = new MarksRequest("student-1", "Mathematics", -5, 100, null);
        assertThrows(ApiException.class, () -> marksService.addMarks(request, "teacher@example.test"));
    }

    @Test
    void totalMarksCannotBeZeroOrNegative() {
        MarksRequest request = new MarksRequest("student-1", "Mathematics", 0, 0, null);
        assertThrows(ApiException.class, () -> marksService.addMarks(request, "teacher@example.test"));
    }

    @Test
    void validMarksAddedWithDraftStatus() {
        Student student = student();
        MarksRequest request = new MarksRequest(
                "student-1", "Mathematics", 85, 100, null, "MID_TERM", "Term 1", "Good progress");
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(student));
        when(marksRepository.save(any(Marks.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Marks created = marksService.addMarks(request, "teacher@school.test");

        assertNotNull(created);
        assertEquals("student-1", created.getStudentId());
        assertEquals("Mathematics", created.getSubject());
        assertEquals(85, created.getMarks());
        assertEquals(100, created.getTotalMarks());
        assertEquals("MID_TERM", created.getAssessmentType());
        assertEquals("Term 1", created.getTerm());
        assertEquals("Good progress", created.getComments());
        assertEquals("DRAFT", created.getStatus());
        assertEquals("teacher@school.test", created.getRecordedBy());
    }

    @Test
    void examOwnershipMismatchThrowsBadRequest() {
        Student student = student();
        Exam exam = new Exam();
        exam.setId("exam-1");
        exam.setClassId("GRADE-11-B"); // Different class than student's GRADE-10-A
        exam.setSubject("Mathematics");
        exam.setTotalMarks(100);

        MarksRequest request = new MarksRequest("student-1", "Mathematics", 75, 100, "exam-1");
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(student));
        when(examRepository.findById("exam-1")).thenReturn(Optional.of(exam));

        ApiException ex = assertThrows(ApiException.class, () -> marksService.addMarks(request, "teacher@school.test"));
        assertEquals("EXAM_OWNERSHIP_MISMATCH", ex.getCode());
    }

    @Test
    void totalMarksExceedingExamMaximumThrowsBadRequest() {
        Student student = student();
        Exam exam = new Exam();
        exam.setId("exam-1");
        exam.setClassId("GRADE-10-A");
        exam.setSubject("Mathematics");
        exam.setTotalMarks(50); // Exam total is 50

        MarksRequest request = new MarksRequest("student-1", "Mathematics", 60, 100, "exam-1"); // Request specifies 100
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(student));
        when(examRepository.findById("exam-1")).thenReturn(Optional.of(exam));

        ApiException ex = assertThrows(ApiException.class, () -> marksService.addMarks(request, "teacher@school.test"));
        assertEquals("TOTAL_MARKS_EXCEEDS_EXAM", ex.getCode());
    }

    @Test
    void duplicateExamMarksEntryThrowsConflict() {
        Student student = student();
        Exam exam = new Exam();
        exam.setId("exam-1");
        exam.setClassId("GRADE-10-A");
        exam.setSubject("Mathematics");
        exam.setTotalMarks(100);

        Marks existing = new Marks();
        existing.setId("existing-marks-1");

        MarksRequest request = new MarksRequest("student-1", "Mathematics", 80, 100, "exam-1");
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(student));
        when(examRepository.findById("exam-1")).thenReturn(Optional.of(exam));
        when(marksRepository.findByStudentIdAndSubjectIgnoreCaseAndExamId("student-1", "Mathematics", "exam-1"))
                .thenReturn(Optional.of(existing));

        ApiException ex = assertThrows(ApiException.class, () -> marksService.addMarks(request, "teacher@school.test"));
        assertEquals("DUPLICATE_MARKS_RECORD", ex.getCode());
    }

    @Test
    void publishedMarksCannotBeUpdatedDirectly() {
        Marks existing = new Marks();
        existing.setId("marks-1");
        existing.setStatus("PUBLISHED");

        MarksRequest request = new MarksRequest("student-1", "Mathematics", 90, 100, null);
        when(marksRepository.findById("marks-1")).thenReturn(Optional.of(existing));

        ApiException ex = assertThrows(ApiException.class, () -> marksService.updateMarks("marks-1", request, "teacher@school.test"));
        assertEquals("MARKS_ALREADY_PUBLISHED", ex.getCode());
    }

    @Test
    void updateDraftMarksSucceeds() {
        Student student = student();
        Marks existing = new Marks();
        existing.setId("marks-1");
        existing.setStatus("DRAFT");
        existing.setMarks(70);

        MarksRequest request = new MarksRequest("student-1", "Mathematics", 92, 100, null, "FINAL", "Term 3", "Excellent");
        when(marksRepository.findById("marks-1")).thenReturn(Optional.of(existing));
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(student));
        when(marksRepository.save(existing)).thenReturn(existing);

        Marks updated = marksService.updateMarks("marks-1", request, "teacher@school.test");

        assertEquals(92, updated.getMarks());
        assertEquals("FINAL", updated.getAssessmentType());
        assertEquals("Term 3", updated.getTerm());
        assertEquals("Excellent", updated.getComments());
    }

    @Test
    void getPublishedMarksByStudentFiltersOutDrafts() {
        Marks published = new Marks();
        published.setId("pub-1");
        published.setStatus("PUBLISHED");

        when(marksRepository.findByStudentIdAndStatusOrderByRecordedAtDesc("student-1", "PUBLISHED"))
                .thenReturn(List.of(published));

        List<Marks> result = marksService.getPublishedMarksByStudent("student-1");
        assertEquals(1, result.size());
        assertEquals("pub-1", result.get(0).getId());
    }

    private Student student() {
        Student student = new Student();
        student.setId("student-1");
        student.setName("Synthetic Student");
        student.setStudentClass("GRADE-10-A");
        return student;
    }
}
