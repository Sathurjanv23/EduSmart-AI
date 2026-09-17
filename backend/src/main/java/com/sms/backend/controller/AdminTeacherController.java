package com.sms.backend.controller;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.TeacherProfileRequest;
import com.sms.backend.dto.TeacherProfileResponse;
import com.sms.backend.service.TeacherProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/teachers")
public class AdminTeacherController {
    private final TeacherProfileService teacherProfileService;

    public AdminTeacherController(TeacherProfileService teacherProfileService) {
        this.teacherProfileService = teacherProfileService;
    }

    @PutMapping("/profile")
    public TeacherProfileResponse upsert(@Valid @RequestBody TeacherProfileRequest request) {
        return teacherProfileService.upsert(request);
    }
}
