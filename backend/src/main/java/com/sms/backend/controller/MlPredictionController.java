package com.sms.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.core.Authentication;

import com.sms.backend.dto.MlPredictionRequest;
import com.sms.backend.dto.MlPredictionResponse;
import com.sms.backend.dto.StudentRiskPredictionResponse;
import com.sms.backend.model.Student;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.AcademicFeatureService;
import com.sms.backend.service.MlPredictionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ml")
public class MlPredictionController {
    private final MlPredictionService predictionService;
    private final AcademicFeatureService featureService;
    private final AcademicAccessService accessService;

    public MlPredictionController(
            MlPredictionService predictionService,
            AcademicFeatureService featureService,
            AcademicAccessService accessService) {
        this.predictionService = predictionService;
        this.featureService = featureService;
        this.accessService = accessService;
    }

    @PostMapping("/predict")
    public MlPredictionResponse predict(@Valid @RequestBody MlPredictionRequest request) {
        return predictionService.predict(request);
    }

    @PostMapping("/students/{studentId}/predict")
    public StudentRiskPredictionResponse predictStudent(
            @PathVariable String studentId,
            Authentication authentication) {
        Student student = accessService.requireStudentAccess(authentication, studentId);
        MlPredictionRequest inputs = featureService.derive(student);
        return new StudentRiskPredictionResponse(student.getId(), inputs, predictionService.predict(inputs));
    }
}
