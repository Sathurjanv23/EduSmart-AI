package com.sms.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.StudentResponse;
import com.sms.backend.security.AcademicAccessService;

@RestController
@RequestMapping("/api/parents")
public class ParentController {
    private final AcademicAccessService accessService;

    public ParentController(AcademicAccessService accessService) {
        this.accessService = accessService;
    }

    @GetMapping("/children")
    public List<StudentResponse> children(Authentication authentication) {
        return accessService.currentParentChildren(authentication).stream().map(StudentResponse::from).toList();
    }
}
