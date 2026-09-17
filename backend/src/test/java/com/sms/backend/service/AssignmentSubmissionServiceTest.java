package com.sms.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.sms.backend.dto.AssignmentSubmissionDTO;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Assignment;
import com.sms.backend.model.AssignmentSubmission;
import com.sms.backend.model.Student;
import com.sms.backend.repository.AssignmentSubmissionRepository;

@ExtendWith(MockitoExtension.class)
class AssignmentSubmissionServiceTest {
    @Mock AssignmentSubmissionRepository repository;
    @Mock AssignmentService assignmentService;

    private AssignmentSubmissionService service;

    @BeforeEach
    void setUp() {
        service = new AssignmentSubmissionService(repository, assignmentService);
    }

    @Test
    void submissionUsesAuthenticatedStudentAndUpdatesExistingDraft() {
        Assignment assignment = assignment();
        Student student = student();
        AssignmentSubmission existing = new AssignmentSubmission();
        existing.setId("submission-1");
        existing.setAssignmentId("assignment-1");
        existing.setStudentId("student-1");
        existing.setStatus("SUBMITTED");
        AssignmentSubmissionDTO request = new AssignmentSubmissionDTO();
        request.setAssignmentId("assignment-1");
        request.setStudentId("someone-else");
        request.setSubmissionText("My own work");

        when(assignmentService.requireById("assignment-1")).thenReturn(assignment);
        when(repository.findByAssignmentIdAndStudentId("assignment-1", "student-1"))
                .thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        AssignmentSubmission result = service.submitAssignment(request, student);

        assertEquals("student-1", result.getStudentId());
        assertEquals("My own work", result.getSubmissionText());
    }

    @Test
    void gradeCannotExceedAssignmentMaximum() {
        Assignment assignment = assignment();
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assignment-1");
        when(repository.findById("submission-1")).thenReturn(Optional.of(submission));
        when(assignmentService.requireById("assignment-1")).thenReturn(assignment);

        assertThrows(ApiException.class, () -> service.gradeSubmission("submission-1", 101, null, "teacher"));
    }

    private Assignment assignment() {
        Assignment assignment = new Assignment();
        assignment.setId("assignment-1");
        assignment.setClassId("GRADE-10-A");
        assignment.setStatus("ACTIVE");
        assignment.setMaxMarks(100);
        assignment.setDueDate(LocalDateTime.now().plusDays(1));
        return assignment;
    }

    private Student student() {
        Student student = new Student();
        student.setId("student-1");
        student.setStudentClass("GRADE-10-A");
        return student;
    }
}
