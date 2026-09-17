package com.sms.backend.security;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Student;
import com.sms.backend.model.TeacherProfile;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.repository.TeacherProfileRepository;

@Service
public class AcademicAccessService {
    private final StudentRepository studentRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    public AcademicAccessService(
            StudentRepository studentRepository,
            TeacherProfileRepository teacherProfileRepository) {
        this.studentRepository = studentRepository;
        this.teacherProfileRepository = teacherProfileRepository;
    }

    public Student currentStudent(Authentication authentication) {
        requireAuthority(authentication, "STUDENT");
        return studentRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> ApiException.notFound("Student profile"));
    }

    public List<Student> currentParentChildren(Authentication authentication) {
        requireAuthority(authentication, "PARENT");
        return studentRepository.findByParentEmail(authentication.getName());
    }

    public Student requireStudentAccess(Authentication authentication, String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> ApiException.notFound("Student"));
        if (hasAuthority(authentication, "ADMIN")) {
            return student;
        }
        if (hasAuthority(authentication, "TEACHER")) {
            TeacherProfile profile = teacherProfileRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> ApiException.forbidden("Teacher profile and class assignments are required"));
            if (profile.getAssignedClassIds() != null
                    && profile.getAssignedClassIds().contains(student.getStudentClass())) {
                return student;
            }
            throw ApiException.forbidden("The student is not in a class assigned to the current teacher");
        }
        if (hasAuthority(authentication, "STUDENT") && authentication.getName().equalsIgnoreCase(student.getEmail())) {
            return student;
        }
        if (hasAuthority(authentication, "PARENT")
                && student.getParentEmail() != null
                && authentication.getName().equalsIgnoreCase(student.getParentEmail())) {
            return student;
        }
        throw ApiException.forbidden("You may only access linked student records");
    }

    public void requireStaff(Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN") && !hasAuthority(authentication, "TEACHER")) {
            throw ApiException.forbidden("Staff access is required");
        }
    }

    public void requireAdmin(Authentication authentication) {
        if (!hasAuthority(authentication, "ADMIN")) {
            throw ApiException.forbidden("Administrator access is required");
        }
    }

    public void requireTeacherClass(Authentication authentication, String classId) {
        if (hasAuthority(authentication, "ADMIN")) {
            return;
        }
        requireAuthority(authentication, "TEACHER");
        if (classId == null || classId.isBlank()) {
            throw ApiException.forbidden("A valid assigned class is required");
        }
        TeacherProfile profile = teacherProfileRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> ApiException.forbidden("Teacher profile and class assignments are required"));
        if (profile.getAssignedClassIds() == null
                || profile.getAssignedClassIds().stream().noneMatch(classId::equals)) {
            throw ApiException.forbidden("This class is not assigned to the current teacher");
        }
    }

    public void requireTeacherSubject(Authentication authentication, String subject) {
        if (hasAuthority(authentication, "ADMIN")) {
            return;
        }
        requireAuthority(authentication, "TEACHER");
        if (subject == null || subject.isBlank()) {
            throw ApiException.forbidden("A valid assigned subject is required");
        }
        TeacherProfile profile = teacherProfileRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> ApiException.forbidden("Teacher profile and subject assignments are required"));
        if (profile.getAssignedSubjects() == null
                || profile.getAssignedSubjects().stream()
                        .noneMatch(value -> value != null && value.equalsIgnoreCase(subject))) {
            throw ApiException.forbidden("This subject is not assigned to the current teacher");
        }
    }

    public void requireClassReadAccess(Authentication authentication, String classId) {
        if (hasAuthority(authentication, "ADMIN")) {
            return;
        }
        if (classId == null || classId.isBlank()) {
            throw ApiException.forbidden("A valid class is required");
        }
        if (hasAuthority(authentication, "TEACHER")) {
            requireTeacherClass(authentication, classId);
            return;
        }
        if (hasAuthority(authentication, "STUDENT")) {
            if (classId.equals(currentStudent(authentication).getStudentClass())) {
                return;
            }
            throw ApiException.forbidden("This class does not belong to the current student");
        }
        if (hasAuthority(authentication, "PARENT")
                && currentParentChildren(authentication).stream()
                        .anyMatch(student -> classId.equals(student.getStudentClass()))) {
            return;
        }
        throw ApiException.forbidden("You are not allowed to access this class");
    }

    public boolean hasAuthority(Authentication authentication, String authority) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(value -> authority.equals(value.getAuthority()));
    }

    private void requireAuthority(Authentication authentication, String authority) {
        if (!hasAuthority(authentication, authority)) {
            throw ApiException.forbidden(authority + " access is required");
        }
    }
}
