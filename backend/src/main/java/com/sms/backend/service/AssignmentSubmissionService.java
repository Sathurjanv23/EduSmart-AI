package com.sms.backend.service;

import com.sms.backend.model.AssignmentSubmission;
import com.sms.backend.dto.AssignmentSubmissionDTO;
import com.sms.backend.repository.AssignmentSubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AssignmentSubmissionService {

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    public AssignmentSubmission submitAssignment(AssignmentSubmissionDTO dto) {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId(dto.getAssignmentId());
        submission.setStudentId(dto.getStudentId());
        submission.setSubmissionFileUrl(dto.getSubmissionFileUrl());
        submission.setSubmissionText(dto.getSubmissionText());
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus("SUBMITTED");
        submission.setCreatedAt(LocalDateTime.now());
        submission.setUpdatedAt(LocalDateTime.now());
        return submissionRepository.save(submission);
    }

    public List<AssignmentSubmission> getSubmissionsByAssignment(String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<AssignmentSubmission> getStudentSubmissions(String studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public AssignmentSubmission getStudentSubmissionForAssignment(String assignmentId, String studentId) {
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);
    }

    public AssignmentSubmission gradeSubmission(String id, Integer marks, String feedback, String gradedBy) {
        Optional<AssignmentSubmission> optional = submissionRepository.findById(id);
        if (optional.isPresent()) {
            AssignmentSubmission submission = optional.get();
            submission.setMarksObtained(marks);
            submission.setFeedback(feedback);
            submission.setGradedBy(gradedBy);
            submission.setGradedAt(LocalDateTime.now());
            submission.setStatus("GRADED");
            submission.setUpdatedAt(LocalDateTime.now());
            return submissionRepository.save(submission);
        }
        return null;
    }
}
