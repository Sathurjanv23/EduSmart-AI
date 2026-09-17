package com.sms.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.AssignmentDTO;
import com.sms.backend.model.Assignment;
import com.sms.backend.model.Student;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.AssignmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {
    private final AssignmentService assignmentService;
    private final AcademicAccessService accessService;

    public AssignmentController(AssignmentService assignmentService, AcademicAccessService accessService) {
        this.assignmentService = assignmentService;
        this.accessService = accessService;
    }

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(
            @Valid @RequestBody AssignmentDTO dto,
            Authentication authentication) {
        accessService.requireTeacherClass(authentication, dto.getClassId());
        accessService.requireTeacherSubject(authentication, dto.getSubject());
        Assignment assignment = assignmentService.createAssignment(dto, authentication.getName());
        return ResponseEntity.created(URI.create("/api/assignments/" + assignment.getId())).body(assignment);
    }

    @GetMapping
    public List<Assignment> getAssignments(Authentication authentication) {
        return assignmentService.getVisibleAssignments(authentication);
    }

    @GetMapping("/available")
    public List<Assignment> getAvailableAssignments(Authentication authentication) {
        Student student = accessService.currentStudent(authentication);
        return assignmentService.getAvailableForStudent(student);
    }

    @GetMapping("/student/{studentId}")
    public List<Assignment> getAssignmentsForStudent(
            @PathVariable String studentId,
            Authentication authentication) {
        Student student = accessService.requireStudentAccess(authentication, studentId);
        return assignmentService.getAvailableForStudent(student);
    }

    @GetMapping("/class/{classId}")
    public List<Assignment> getAssignmentsByClass(
            @PathVariable String classId,
            Authentication authentication) {
        accessService.requireClassReadAccess(authentication, classId);
        if (accessService.hasAuthority(authentication, "ADMIN")) {
            return assignmentService.getAssignmentsByClass(classId);
        }
        return assignmentService.getVisibleAssignments(authentication).stream()
                .filter(assignment -> classId.equals(assignment.getClassId()))
                .toList();
    }

    @GetMapping("/{id}")
    public Assignment getAssignmentById(@PathVariable String id, Authentication authentication) {
        Assignment assignment = assignmentService.requireById(id);
        accessService.requireClassReadAccess(authentication, assignment.getClassId());
        if (accessService.hasAuthority(authentication, "TEACHER")) {
            accessService.requireTeacherSubject(authentication, assignment.getSubject());
        } else if (!accessService.hasAuthority(authentication, "ADMIN")
                && !"ACTIVE".equals(assignment.getStatus())) {
            throw com.sms.backend.exception.ApiException.notFound("Assignment");
        }
        return assignment;
    }

    @PutMapping("/{id}")
    public Assignment updateAssignment(
            @PathVariable String id,
            @Valid @RequestBody AssignmentDTO dto,
            Authentication authentication) {
        Assignment existing = assignmentService.requireById(id);
        accessService.requireTeacherClass(authentication, existing.getClassId());
        accessService.requireTeacherSubject(authentication, existing.getSubject());
        accessService.requireTeacherClass(authentication, dto.getClassId());
        accessService.requireTeacherSubject(authentication, dto.getSubject());
        return assignmentService.updateAssignment(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable String id, Authentication authentication) {
        Assignment existing = assignmentService.requireById(id);
        accessService.requireTeacherClass(authentication, existing.getClassId());
        accessService.requireTeacherSubject(authentication, existing.getSubject());
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
