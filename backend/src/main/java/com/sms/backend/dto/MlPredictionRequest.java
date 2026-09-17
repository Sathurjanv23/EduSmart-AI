package com.sms.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

public record MlPredictionRequest(
        @JsonProperty("attendance_percentage")
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double attendancePercentage,
        @JsonProperty("average_marks")
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double averageMarks,
        @JsonProperty("assignment_completion_rate")
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double assignmentCompletionRate,
        @JsonProperty("recent_grade_trend")
        @NotNull @DecimalMin("-100.0") @DecimalMax("100.0") Double recentGradeTrend,
        @JsonProperty("missed_assignments")
        @NotNull @Min(0) @Max(50) Integer missedAssignments) {
}
