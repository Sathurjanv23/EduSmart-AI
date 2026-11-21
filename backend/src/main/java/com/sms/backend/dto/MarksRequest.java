package com.sms.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Data transfer object for creating or updating an academic marks entry.
 *
 * <p>Supports backward compatibility: existing consumers supplying only
 * (studentId, subject, marks, totalMarks, examId) will continue to work seamlessly.
 */
public record MarksRequest(
        @NotBlank @Size(max = 100) String studentId,
        @NotBlank @Size(max = 80) String subject,
        @Min(0) @Max(100000) int marks,
        @Min(1) @Max(100000) int totalMarks,
        @Size(max = 100) String examId,
        @Pattern(regexp = "^(TERM_TEST|MID_TERM|FINAL|CLASS_TEST|ASSIGNMENT|OTHER)?$",
                 message = "assessmentType must be one of TERM_TEST, MID_TERM, FINAL, CLASS_TEST, ASSIGNMENT, OTHER")
        @Size(max = 20) String assessmentType,
        @Size(max = 50) String term,
        @Size(max = 500) String comments,
        @Size(max = 100) String assessmentId) {

    /**
     * Backward-compatible 5-argument constructor for existing callers and tests.
     */
    public MarksRequest(String studentId, String subject, int marks, int totalMarks, String examId) {
        this(studentId, subject, marks, totalMarks, examId, null, null, null, null);
    }

    /**
     * Backward-compatible 8-argument constructor for Task 02.1 callers.
     */
    public MarksRequest(String studentId, String subject, int marks, int totalMarks, String examId,
                        String assessmentType, String term, String comments) {
        this(studentId, subject, marks, totalMarks, examId, assessmentType, term, comments, null);
    }
}
