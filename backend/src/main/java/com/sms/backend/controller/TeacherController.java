package com.sms.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.StudentResponse;
import com.sms.backend.dto.TeacherProfileResponse;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.StudentService;
import com.sms.backend.service.TeacherProfileService;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {
    private final TeacherProfileService teacherProfileService;
    private final StudentService studentService;
    private final AcademicAccessService accessService;

    public TeacherController(
            TeacherProfileService teacherProfileService,
            StudentService studentService,
            AcademicAccessService accessService) {
        this.teacherProfileService = teacherProfileService;
        this.studentService = studentService;
        this.accessService = accessService;
    }

    @GetMapping("/profile")
    public TeacherProfileResponse profile(Authentication authentication) {
        return teacherProfileService.getCurrent(authentication.getName());
    }

    @GetMapping("/classes")
    public List<String> classes(Authentication authentication) {
        return teacherProfileService.getCurrent(authentication.getName()).assignedClassIds();
    }

    @GetMapping("/classes/{classId}/students")
    public List<StudentResponse> classStudents(
            @PathVariable String classId,
            Authentication authentication) {
        accessService.requireTeacherClass(authentication, classId);
        return studentService.getStudentsByClass(classId);
    }
}
