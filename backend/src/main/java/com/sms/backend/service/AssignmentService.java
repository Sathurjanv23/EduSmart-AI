package com.sms.backend.service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.sms.backend.dto.AssignmentDTO;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Assignment;
import com.sms.backend.model.Student;
import com.sms.backend.model.TeacherProfile;
import com.sms.backend.repository.AssignmentRepository;
import com.sms.backend.repository.TeacherProfileRepository;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.security.UploadReferenceValidator;

@Service
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final AcademicAccessService accessService;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            TeacherProfileRepository teacherProfileRepository,
            AcademicAccessService accessService) {
        this.assignmentRepository = assignmentRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.accessService = accessService;
    }

    public Assignment createAssignment(AssignmentDTO dto, String createdBy) {
        Assignment assignment = new Assignment();
        apply(assignment, dto);
        assignment.setCreatedBy(createdBy);
        assignment.setStatus("ACTIVE");
        assignment.setCreatedAt(LocalDateTime.now());
        assignment.setUpdatedAt(LocalDateTime.now());
        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getVisibleAssignments(Authentication authentication) {
        if (accessService.hasAuthority(authentication, "ADMIN")) {
            return assignmentRepository.findAll();
        }
        if (accessService.hasAuthority(authentication, "TEACHER")) {
            TeacherProfile profile = teacherProfileRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> ApiException.forbidden("Teacher profile and class assignments are required"));
            List<String> classIds = profile.getAssignedClassIds() == null
                    ? List.of() : profile.getAssignedClassIds();
            List<String> subjects = profile.getAssignedSubjects() == null
                    ? List.of() : profile.getAssignedSubjects();
            return assignmentRepository.findByClassIdInAndStatus(classIds, "ACTIVE").stream()
                    .filter(assignment -> subjects.stream()
                            .anyMatch(subject -> subject.equalsIgnoreCase(assignment.getSubject())))
                    .toList();
        }
        if (accessService.hasAuthority(authentication, "STUDENT")) {
            Student student = accessService.currentStudent(authentication);
            return assignmentRepository.findByClassIdAndStatus(student.getStudentClass(), "ACTIVE");
        }
        Map<String, Assignment> unique = new LinkedHashMap<>();
        accessService.currentParentChildren(authentication).forEach(student ->
                assignmentRepository.findByClassIdAndStatus(student.getStudentClass(), "ACTIVE")
                        .forEach(assignment -> unique.put(assignment.getId(), assignment)));
        return List.copyOf(unique.values());
    }

    public List<Assignment> getAvailableForStudent(Student student) {
        return assignmentRepository.findByClassIdAndStatus(student.getStudentClass(), "ACTIVE");
    }

    public List<Assignment> getAssignmentsByClass(String classId) {
        return assignmentRepository.findByClassId(classId);
    }

    public Assignment requireById(String id) {
        return assignmentRepository.findById(id).orElseThrow(() -> ApiException.notFound("Assignment"));
    }

    public Assignment updateAssignment(String id, AssignmentDTO dto) {
        Assignment assignment = requireById(id);
        apply(assignment, dto);
        assignment.setUpdatedAt(LocalDateTime.now());
        return assignmentRepository.save(assignment);
    }

    public void deleteAssignment(String id) {
        assignmentRepository.delete(requireById(id));
    }

    private void apply(Assignment assignment, AssignmentDTO dto) {
        assignment.setTitle(dto.getTitle().trim());
        assignment.setDescription(dto.getDescription().trim());
        assignment.setClassId(dto.getClassId().trim());
        assignment.setSubject(dto.getSubject().trim());
        assignment.setDueDate(dto.getDueDate());
        assignment.setMaxMarks(dto.getMaxMarks());
        assignment.setFileUrl(UploadReferenceValidator.normalizeOptional(dto.getFileUrl()));
        assignment.setAttachmentUrl(UploadReferenceValidator.normalizeOptional(dto.getAttachmentUrl()));
    }
}
