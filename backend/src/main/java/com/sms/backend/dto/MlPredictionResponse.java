package com.sms.backend.dto;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MlPredictionResponse(
        @JsonProperty("risk_level") String riskLevel,
        Map<String, Double> probabilities,
        Double confidence,
        @JsonProperty("feature_contributions") List<FeatureContribution> featureContributions,
        @JsonProperty("model_version") String modelVersion,
        String disclaimer) {

    public record FeatureContribution(
            String feature,
            Double value,
            Double contribution,
            String direction) {
    }
}
