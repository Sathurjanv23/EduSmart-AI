package com.sms.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StudentRiskPredictionResponse(
        @JsonProperty("student_id") String studentId,
        @JsonProperty("derived_inputs") MlPredictionRequest derivedInputs,
        MlPredictionResponse prediction) {
}
