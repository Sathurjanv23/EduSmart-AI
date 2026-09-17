package com.sms.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MarksRequest(
        @NotBlank @Size(max = 100) String studentId,
        @NotBlank @Size(max = 80) String subject,
        @Min(0) @Max(100000) int marks,
        @Min(1) @Max(100000) int totalMarks,
        @Size(max = 100) String examId) {
}
