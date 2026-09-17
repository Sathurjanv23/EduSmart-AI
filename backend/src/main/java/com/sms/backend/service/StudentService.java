package com.sms.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sms.backend.dto.StudentRequest;
import com.sms.backend.dto.StudentResponse;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Student;
import com.sms.backend.model.User;
import com.sms.backend.model.UserRole;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.repository.UserRepository;

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentService(StudentRepository studentRepository, UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    public StudentResponse addStudent(StudentRequest request, String createdBy) {
        String email = normalizeEmail(request.email());
        if (studentRepository.findByEmail(email).isPresent()) {
            throw ApiException.conflict("STUDENT_EMAIL_EXISTS", "A student profile already exists for this email");
        }
        User studentUser = requireUserWithRole(email, UserRole.STUDENT, "student");
        String parentEmail = normalizeOptionalEmail(request.parentEmail());
        if (parentEmail != null) {
            requireUserWithRole(parentEmail, UserRole.PARENT, "parent");
        }

        Student student = new Student();
        student.setUserId(studentUser.getId());
        apply(student, request, parentEmail);
        student.setCreatedAt(Instant.now());
        student.setUpdatedAt(Instant.now());
        student.setCreatedBy(createdBy);
        return StudentResponse.from(studentRepository.save(student));
    }

    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream().map(StudentResponse::from).toList();
    }

    public Page<StudentResponse> getStudentsPage(String search, Pageable pageable) {
        Page<Student> page = search == null || search.isBlank()
                ? studentRepository.findAll(pageable)
                : studentRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        search.trim(), search.trim(), pageable);
        return page.map(StudentResponse::from);
    }

    public List<StudentResponse> getStudentsByParentEmail(String parentEmail) {
        return studentRepository.findByParentEmail(normalizeEmail(parentEmail)).stream()
                .map(StudentResponse::from)
                .toList();
    }

    public List<StudentResponse> getStudentsByClass(String classId) {
        return studentRepository.findByStudentClass(classId.trim()).stream()
                .map(StudentResponse::from)
                .toList();
    }

    public StudentResponse getById(String id) {
        return StudentResponse.from(requireEntity(id));
    }

    public StudentResponse getByEmail(String email) {
        return StudentResponse.from(requireByEmail(email));
    }

    public Student requireEntity(String id) {
        return studentRepository.findById(id).orElseThrow(() -> ApiException.notFound("Student"));
    }

    public Student requireByEmail(String email) {
        return studentRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> ApiException.notFound("Student profile"));
    }

    public void deleteStudent(String id) {
        Student student = requireEntity(id);
        studentRepository.delete(student);
    }

    public StudentResponse updateStudent(String id, StudentRequest request) {
        Student student = requireEntity(id);
        String email = normalizeEmail(request.email());
        studentRepository.findByEmail(email)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw ApiException.conflict("STUDENT_EMAIL_EXISTS", "A student profile already exists for this email");
                });
        User studentUser = requireUserWithRole(email, UserRole.STUDENT, "student");
        String parentEmail = normalizeOptionalEmail(request.parentEmail());
        if (parentEmail != null) {
            requireUserWithRole(parentEmail, UserRole.PARENT, "parent");
        }
        student.setUserId(studentUser.getId());
        apply(student, request, parentEmail);
        student.setUpdatedAt(Instant.now());
        return StudentResponse.from(studentRepository.save(student));
    }

    private void apply(Student student, StudentRequest request, String parentEmail) {
        student.setName(request.name().trim());
        student.setEmail(normalizeEmail(request.email()));
        student.setParentEmail(parentEmail);
        student.setStudentClass(request.studentClass().trim());
        student.setGender(request.gender() == null || request.gender().isBlank()
                ? null : request.gender().trim().toUpperCase(Locale.ROOT));
    }

    private User requireUserWithRole(String email, UserRole role, String relationship) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.badRequest(
                        "MISSING_" + role.name() + "_ACCOUNT",
                        "Create the linked " + relationship + " user account first"));
        if (user.getRole() != role) {
            throw ApiException.badRequest("INVALID_" + role.name() + "_ACCOUNT",
                    "The linked email does not belong to a " + relationship + " account");
        }
        return user;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptionalEmail(String email) {
        return email == null || email.isBlank() ? null : normalizeEmail(email);
    }
}
