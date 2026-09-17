package com.sms.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GradeSubmissionRequest(
        @NotNull @Min(0) Integer marks,
        @Size(max = 2000) String feedback) {
}
