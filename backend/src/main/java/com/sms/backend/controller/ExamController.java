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

import com.sms.backend.dto.ExamDTO;
import com.sms.backend.model.Exam;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.ExamService;
import com.sms.backend.service.TeacherProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/exams")
public class ExamController {
    private final ExamService examService;
    private final AcademicAccessService accessService;
    private final TeacherProfileService teacherProfileService;

    public ExamController(
            ExamService examService,
            AcademicAccessService accessService,
            TeacherProfileService teacherProfileService) {
        this.examService = examService;
        this.accessService = accessService;
        this.teacherProfileService = teacherProfileService;
    }

    @PostMapping
    public ResponseEntity<Exam> createExam(
            @Valid @RequestBody ExamDTO dto,
            Authentication authentication) {
        authorizeTarget(authentication, dto.getClassId(), dto.getSubject());
        Exam saved = examService.createExam(dto, authentication.getName());
        return ResponseEntity.created(URI.create("/api/exams/" + saved.getId())).body(saved);
    }

    @PostMapping("/{examId}/publish")
    public Exam publishExam(@PathVariable String examId, Authentication authentication) {
        Exam exam = examService.requireById(examId);
        authorizeTarget(authentication, exam.getClassId(), exam.getSubject());
        return examService.publishExam(examId);
    }

    @GetMapping("/class/{classId}")
    public List<Exam> getExamsByClass(@PathVariable String classId, Authentication authentication) {
        accessService.requireClassReadAccess(authentication, classId);
        boolean publishedOnly = !accessService.hasAuthority(authentication, "ADMIN")
                && !accessService.hasAuthority(authentication, "TEACHER");
        List<Exam> exams = examService.getExamsByClass(classId, publishedOnly);
        if (!accessService.hasAuthority(authentication, "TEACHER")) {
            return exams;
        }
        List<String> assignedSubjects = teacherProfileService.getCurrent(authentication.getName()).assignedSubjects();
        return exams.stream()
                .filter(exam -> assignedSubjects.stream()
                        .anyMatch(subject -> subject.equalsIgnoreCase(exam.getSubject())))
                .toList();
    }

    @GetMapping("/subject/{subject}")
    public List<Exam> getExamsBySubject(@PathVariable String subject, Authentication authentication) {
        accessService.requireStaff(authentication);
        if (accessService.hasAuthority(authentication, "TEACHER")) {
            accessService.requireTeacherSubject(authentication, subject);
            List<String> classIds = teacherProfileService.getCurrent(authentication.getName()).assignedClassIds();
            return examService.getExamsBySubject(subject).stream()
                    .filter(exam -> classIds.contains(exam.getClassId()))
                    .toList();
        }
        return examService.getExamsBySubject(subject);
    }

    @GetMapping("/{id}")
    public Exam getExamById(@PathVariable String id, Authentication authentication) {
        Exam exam = examService.requireById(id);
        accessService.requireClassReadAccess(authentication, exam.getClassId());
        if (accessService.hasAuthority(authentication, "TEACHER")) {
            accessService.requireTeacherSubject(authentication, exam.getSubject());
        }
        if (!accessService.hasAuthority(authentication, "ADMIN")
                && !accessService.hasAuthority(authentication, "TEACHER")
                && !"PUBLISHED".equals(exam.getStatus())) {
            throw com.sms.backend.exception.ApiException.notFound("Exam");
        }
        return exam;
    }

    @PutMapping("/{id}")
    public Exam updateExam(
            @PathVariable String id,
            @Valid @RequestBody ExamDTO dto,
            Authentication authentication) {
        Exam existing = examService.requireById(id);
        authorizeTarget(authentication, existing.getClassId(), existing.getSubject());
        authorizeTarget(authentication, dto.getClassId(), dto.getSubject());
        return examService.updateExam(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable String id, Authentication authentication) {
        Exam existing = examService.requireById(id);
        authorizeTarget(authentication, existing.getClassId(), existing.getSubject());
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    private void authorizeTarget(Authentication authentication, String classId, String subject) {
        accessService.requireTeacherClass(authentication, classId);
        accessService.requireTeacherSubject(authentication, subject);
    }
}
