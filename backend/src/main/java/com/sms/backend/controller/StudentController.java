package com.sms.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.StudentRequest;
import com.sms.backend.dto.StudentResponse;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.StudentService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService studentService;
    private final AcademicAccessService accessService;

    public StudentController(StudentService studentService, AcademicAccessService accessService) {
        this.studentService = studentService;
        this.accessService = accessService;
    }

    @PostMapping
    public ResponseEntity<StudentResponse> addStudent(
            @Valid @RequestBody StudentRequest request,
            Authentication authentication) {
        StudentResponse created = studentService.addStudent(request, authentication.getName());
        return ResponseEntity.created(URI.create("/api/students/" + created.id())).body(created);
    }

    @GetMapping
    public List<StudentResponse> getAllStudents(Authentication authentication) {
        accessService.requireAdmin(authentication);
        return studentService.getAllStudents();
    }

    @GetMapping("/page")
    public Page<StudentResponse> getStudentsPage(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            Authentication authentication) {
        accessService.requireAdmin(authentication);
        return studentService.getStudentsPage(search, PageRequest.of(page, size, Sort.by("name").ascending()));
    }

    @GetMapping("/me")
    public StudentResponse getCurrentStudent(Authentication authentication) {
        return StudentResponse.from(accessService.currentStudent(authentication));
    }

    @GetMapping("/parent")
    public List<StudentResponse> getStudentsForParent(Authentication authentication) {
        return accessService.currentParentChildren(authentication).stream().map(StudentResponse::from).toList();
    }

    @GetMapping("/class/{classId}")
    public List<StudentResponse> getStudentsForClass(
            @PathVariable String classId,
            Authentication authentication) {
        accessService.requireTeacherClass(authentication, classId);
        return studentService.getStudentsByClass(classId);
    }

    @GetMapping("/{id}")
    public StudentResponse getStudent(@PathVariable String id, Authentication authentication) {
        return StudentResponse.from(accessService.requireStudentAccess(authentication, id));
    }

    @PutMapping("/{id}")
    public StudentResponse updateStudent(@PathVariable String id, @Valid @RequestBody StudentRequest request) {
        return studentService.updateStudent(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
