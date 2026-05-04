package com.sms.backend.controller;

import com.sms.backend.model.Assignment;
import com.sms.backend.dto.AssignmentDTO;
import com.sms.backend.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(
            @RequestBody AssignmentDTO dto,
            @RequestParam String teacherId) {
        return ResponseEntity.ok(assignmentService.createAssignment(dto, teacherId));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByClass(@PathVariable String classId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByClass(classId));
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<Assignment>> getAssignmentsBySubject(@PathVariable String subject) {
        return ResponseEntity.ok(assignmentService.getAssignmentsBySubject(subject));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(@PathVariable String id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assignment> updateAssignment(@PathVariable String id, @RequestBody AssignmentDTO dto) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAssignment(@PathVariable String id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok("Assignment deleted successfully");
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByTeacher(teacherId));
    }
}
