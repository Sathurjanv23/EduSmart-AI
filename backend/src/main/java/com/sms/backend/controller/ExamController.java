package com.sms.backend.controller;

import com.sms.backend.model.Exam;
import com.sms.backend.dto.ExamDTO;
import com.sms.backend.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    @Autowired
    private ExamService examService;

    @PostMapping
    public ResponseEntity<Exam> createExam(@RequestBody ExamDTO dto) {
        return ResponseEntity.ok(examService.createExam(dto));
    }

    @PostMapping("/{examId}/publish")
    public ResponseEntity<Exam> publishExam(@PathVariable String examId) {
        return ResponseEntity.ok(examService.publishExam(examId));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Exam>> getExamsByClass(@PathVariable String classId) {
        return ResponseEntity.ok(examService.getExamsByClass(classId));
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Exam>> getExamsBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(examService.getExamsBySubject(subject));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable String id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable String id, @RequestBody ExamDTO dto) {
        return ResponseEntity.ok(examService.updateExam(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExam(@PathVariable String id) {
        examService.deleteExam(id);
        return ResponseEntity.ok("Exam deleted successfully");
    }
}
