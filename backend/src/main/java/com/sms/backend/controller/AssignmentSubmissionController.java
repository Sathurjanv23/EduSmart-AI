package com.sms.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.AssignmentSubmissionDTO;
import com.sms.backend.dto.GradeSubmissionRequest;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Assignment;
import com.sms.backend.model.AssignmentSubmission;
import com.sms.backend.model.Student;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.AssignmentService;
import com.sms.backend.service.AssignmentSubmissionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assignments/submissions")
public class AssignmentSubmissionController {
    private final AssignmentSubmissionService submissionService;
    private final AssignmentService assignmentService;
    private final AcademicAccessService accessService;

    public AssignmentSubmissionController(
            AssignmentSubmissionService submissionService,
            AssignmentService assignmentService,
            AcademicAccessService accessService) {
        this.submissionService = submissionService;
        this.assignmentService = assignmentService;
        this.accessService = accessService;
    }

    @GetMapping
    public List<AssignmentSubmission> getSubmissions(
            @RequestParam(required = false) String studentId,
            @RequestParam(required = false) String assignmentId,
            Authentication authentication) {
        if (assignmentId != null && !assignmentId.isBlank()) {
            Assignment assignment = assignmentService.requireById(assignmentId);
            accessService.requireTeacherClass(authentication, assignment.getClassId());
            accessService.requireTeacherSubject(authentication, assignment.getSubject());
            return submissionService.getSubmissionsByAssignment(assignmentId);
        }
        if (studentId != null && !studentId.isBlank()) {
            forbidTeacherStudentWideListing(authentication);
            accessService.requireStudentAccess(authentication, studentId);
            return submissionService.getStudentSubmissions(studentId);
        }
        if (accessService.hasAuthority(authentication, "STUDENT")) {
            return submissionService.getStudentSubmissions(accessService.currentStudent(authentication).getId());
        }
        throw ApiException.badRequest("FILTER_REQUIRED", "Provide a studentId or assignmentId filter");
    }

    @GetMapping("/mine")
    public List<AssignmentSubmission> mine(Authentication authentication) {
        Student student = accessService.currentStudent(authentication);
        return submissionService.getStudentSubmissions(student.getId());
    }

    @GetMapping("/student/{studentId}")
    public List<AssignmentSubmission> byStudent(
            @PathVariable String studentId,
            Authentication authentication) {
        forbidTeacherStudentWideListing(authentication);
        accessService.requireStudentAccess(authentication, studentId);
        return submissionService.getStudentSubmissions(studentId);
    }

    @GetMapping("/assignment/{assignmentId}")
    public List<AssignmentSubmission> byAssignment(
            @PathVariable String assignmentId,
            Authentication authentication) {
        Assignment assignment = assignmentService.requireById(assignmentId);
        accessService.requireTeacherClass(authentication, assignment.getClassId());
        accessService.requireTeacherSubject(authentication, assignment.getSubject());
        return submissionService.getSubmissionsByAssignment(assignmentId);
    }

    @GetMapping("/assignment/{assignmentId}/mine")
    public AssignmentSubmission mineForAssignment(
            @PathVariable String assignmentId,
            Authentication authentication) {
        Student student = accessService.currentStudent(authentication);
        Assignment assignment = assignmentService.requireById(assignmentId);
        if (!assignment.getClassId().equals(student.getStudentClass())) {
            throw ApiException.forbidden("This assignment is not available to the current student");
        }
        return submissionService.getStudentSubmissionForAssignment(assignmentId, student.getId());
    }

    @PostMapping
    public ResponseEntity<AssignmentSubmission> submitAssignment(
            @Valid @RequestBody AssignmentSubmissionDTO request,
            Authentication authentication) {
        Student student = accessService.currentStudent(authentication);
        AssignmentSubmission submission = submissionService.submitAssignment(request, student);
        return ResponseEntity.created(URI.create("/api/assignments/submissions/" + submission.getId()))
                .body(submission);
    }

    @PatchMapping("/{id}/grade")
    public AssignmentSubmission grade(
            @PathVariable String id,
            @Valid @RequestBody GradeSubmissionRequest request,
            Authentication authentication) {
        AssignmentSubmission submission = submissionService.requireById(id);
        Assignment assignment = assignmentService.requireById(submission.getAssignmentId());
        accessService.requireTeacherClass(authentication, assignment.getClassId());
        accessService.requireTeacherSubject(authentication, assignment.getSubject());
        return submissionService.gradeSubmission(id, request.marks(), request.feedback(), authentication.getName());
    }

    private void forbidTeacherStudentWideListing(Authentication authentication) {
        if (accessService.hasAuthority(authentication, "TEACHER")) {
            throw ApiException.forbidden("Teachers must query submissions by an assigned assignment");
        }
    }
}
