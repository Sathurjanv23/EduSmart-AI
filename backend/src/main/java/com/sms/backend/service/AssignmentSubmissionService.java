package com.sms.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sms.backend.dto.AssignmentSubmissionDTO;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Assignment;
import com.sms.backend.model.AssignmentSubmission;
import com.sms.backend.model.Student;
import com.sms.backend.repository.AssignmentSubmissionRepository;
import com.sms.backend.security.UploadReferenceValidator;

@Service
public class AssignmentSubmissionService {
    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentService assignmentService;

    public AssignmentSubmissionService(
            AssignmentSubmissionRepository submissionRepository,
            AssignmentService assignmentService) {
        this.submissionRepository = submissionRepository;
        this.assignmentService = assignmentService;
    }

    public AssignmentSubmission submitAssignment(AssignmentSubmissionDTO dto, Student student) {
        Assignment assignment = assignmentService.requireById(dto.getAssignmentId());
        if (!"ACTIVE".equals(assignment.getStatus())) {
            throw ApiException.conflict("ASSIGNMENT_CLOSED", "This assignment is not accepting submissions");
        }
        if (!assignment.getClassId().equals(student.getStudentClass())) {
            throw ApiException.forbidden("This assignment is not available to the current student");
        }
        boolean hasFile = dto.getSubmissionFileUrl() != null && !dto.getSubmissionFileUrl().isBlank();
        boolean hasText = dto.getSubmissionText() != null && !dto.getSubmissionText().isBlank();
        if (!hasFile && !hasText) {
            throw ApiException.badRequest("EMPTY_SUBMISSION", "Provide submission text or an uploaded file");
        }

        LocalDateTime now = LocalDateTime.now();
        AssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignment.getId(), student.getId())
                .orElseGet(() -> {
                    AssignmentSubmission created = new AssignmentSubmission();
                    created.setAssignmentId(assignment.getId());
                    created.setStudentId(student.getId());
                    created.setCreatedAt(now);
                    return created;
                });
        if ("GRADED".equals(submission.getStatus())) {
            throw ApiException.conflict("SUBMISSION_ALREADY_GRADED", "A graded submission cannot be replaced");
        }
        submission.setSubmissionFileUrl(UploadReferenceValidator.normalizeOptional(dto.getSubmissionFileUrl()));
        submission.setSubmissionText(hasText ? dto.getSubmissionText().trim() : null);
        submission.setSubmittedAt(now);
        submission.setStatus(now.isAfter(assignment.getDueDate()) ? "LATE" : "SUBMITTED");
        submission.setUpdatedAt(now);
        return submissionRepository.save(submission);
    }

    public List<AssignmentSubmission> getSubmissionsByAssignment(String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<AssignmentSubmission> getStudentSubmissions(String studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public AssignmentSubmission getStudentSubmissionForAssignment(String assignmentId, String studentId) {
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .orElseThrow(() -> ApiException.notFound("Assignment submission"));
    }

    public AssignmentSubmission requireById(String id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Assignment submission"));
    }

    public AssignmentSubmission gradeSubmission(String id, Integer marks, String feedback, String gradedBy) {
        AssignmentSubmission submission = requireById(id);
        Assignment assignment = assignmentService.requireById(submission.getAssignmentId());
        if (marks < 0 || marks > assignment.getMaxMarks()) {
            throw ApiException.badRequest("INVALID_GRADE", "Grade must be between zero and the assignment maximum");
        }
        submission.setMarksObtained(marks);
        submission.setFeedback(feedback == null || feedback.isBlank() ? null : feedback.trim());
        submission.setGradedBy(gradedBy);
        submission.setGradedAt(LocalDateTime.now());
        submission.setStatus("GRADED");
        submission.setUpdatedAt(LocalDateTime.now());
        return submissionRepository.save(submission);
    }
}
