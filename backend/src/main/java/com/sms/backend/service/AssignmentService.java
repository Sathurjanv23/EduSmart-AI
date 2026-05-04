package com.sms.backend.service;

import com.sms.backend.model.Assignment;
import com.sms.backend.dto.AssignmentDTO;
import com.sms.backend.repository.AssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    public Assignment createAssignment(AssignmentDTO dto, String teacherId) {
        Assignment assignment = new Assignment();
        assignment.setTitle(dto.getTitle());
        assignment.setDescription(dto.getDescription());
        assignment.setClassId(dto.getClassId());
        assignment.setSubject(dto.getSubject());
        assignment.setCreatedBy(teacherId);
        assignment.setDueDate(dto.getDueDate());
        assignment.setMaxMarks(dto.getMaxMarks());
        assignment.setFileUrl(dto.getFileUrl());
        assignment.setAttachmentUrl(dto.getAttachmentUrl());
        assignment.setStatus("ACTIVE");
        assignment.setCreatedAt(LocalDateTime.now());
        assignment.setUpdatedAt(LocalDateTime.now());
        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAssignmentsByClass(String classId) {
        return assignmentRepository.findByClassId(classId);
    }

    public List<Assignment> getAssignmentsBySubject(String subject) {
        return assignmentRepository.findBySubject(subject);
    }

    public Assignment getAssignmentById(String id) {
        String assignmentId = Objects.requireNonNull(id, "id must not be null");
        return assignmentRepository.findById(assignmentId).orElse(null);
    }

    public Assignment updateAssignment(String id, AssignmentDTO dto) {
        String assignmentId = Objects.requireNonNull(id, "id must not be null");
        Optional<Assignment> optional = assignmentRepository.findById(assignmentId);
        if (optional.isPresent()) {
            Assignment assignment = optional.get();
            assignment.setTitle(dto.getTitle());
            assignment.setDescription(dto.getDescription());
            assignment.setDueDate(dto.getDueDate());
            assignment.setMaxMarks(dto.getMaxMarks());
            assignment.setUpdatedAt(LocalDateTime.now());
            return assignmentRepository.save(assignment);
        }
        return null;
    }

    public void deleteAssignment(String id) {
        String assignmentId = Objects.requireNonNull(id, "id must not be null");
        assignmentRepository.deleteById(assignmentId);
    }

    public List<Assignment> getAssignmentsByTeacher(String teacherId) {
        return assignmentRepository.findByCreatedBy(teacherId);
    }
}
