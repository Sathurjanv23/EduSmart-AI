package com.sms.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.MarksRequest;
import com.sms.backend.model.Marks;
import com.sms.backend.model.Student;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.MarksService;
import com.sms.backend.service.StudentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/marks")
public class MarksController {
    private final MarksService marksService;
    private final StudentService studentService;
    private final AcademicAccessService accessService;

    public MarksController(
            MarksService marksService,
            StudentService studentService,
            AcademicAccessService accessService) {
        this.marksService = marksService;
        this.studentService = studentService;
        this.accessService = accessService;
    }

    @PostMapping
    public Marks addMarks(@Valid @RequestBody MarksRequest request, Authentication authentication) {
        Student student = studentService.requireEntity(request.studentId());
        accessService.requireTeacherClass(authentication, student.getStudentClass());
        accessService.requireTeacherSubject(authentication, request.subject());
        return marksService.addMarks(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public Marks updateMarks(
            @PathVariable String id,
            @Valid @RequestBody MarksRequest request,
            Authentication authentication) {
        Marks existing = marksService.requireById(id);
        accessService.requireTeacherClass(authentication, existing.getClassId());
        accessService.requireTeacherSubject(authentication, existing.getSubject());
        Student student = studentService.requireEntity(request.studentId());
        accessService.requireTeacherClass(authentication, student.getStudentClass());
        accessService.requireTeacherSubject(authentication, request.subject());
        return marksService.updateMarks(id, request, authentication.getName());
    }

    @GetMapping
    public List<Marks> getAllMarks(Authentication authentication) {
        accessService.requireAdmin(authentication);
        return marksService.getAllMarks();
    }

    @GetMapping("/me")
    public List<Marks> getMyMarks(Authentication authentication) {
        Student student = accessService.currentStudent(authentication);
        return marksService.getMarksByStudent(student.getId());
    }

    @GetMapping("/student/{studentId}")
    public List<Marks> getMarksByStudent(
            @PathVariable String studentId,
            Authentication authentication) {
        accessService.requireStudentAccess(authentication, studentId);
        return marksService.getMarksByStudent(studentId);
    }
}
