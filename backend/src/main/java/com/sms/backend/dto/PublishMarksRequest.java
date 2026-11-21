package com.sms.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload to publish academic marks for a validated assessment/class/subject context.
 */
public record PublishMarksRequest(
        @NotBlank(message = "classId is required")
        @Size(max = 100)
        String classId,

        @NotBlank(message = "subject is required")
        @Size(max = 80)
        String subject,

        @Size(max = 100)
        String examId,

        @Size(max = 20)
        String assessmentType,

        @Size(max = 50)
        String term,

        @Size(max = 100)
        String assessmentId,

        List<String> markIds,

        boolean allowPartial
) {
    public PublishMarksRequest(String classId, String subject, String examId, List<String> markIds, boolean allowPartial) {
        this(classId, subject, examId, null, null, null, markIds, allowPartial);
    }
}
