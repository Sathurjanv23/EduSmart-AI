package com.sms.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Student;
import com.sms.backend.model.TeacherProfile;
import com.sms.backend.repository.StudentRepository;
import com.sms.backend.repository.TeacherProfileRepository;

@ExtendWith(MockitoExtension.class)
class AcademicAccessServiceTest {
    @Mock StudentRepository studentRepository;
    @Mock TeacherProfileRepository teacherProfileRepository;

    private AcademicAccessService service;
    private Authentication teacher;

    @BeforeEach
    void setUp() {
        service = new AcademicAccessService(studentRepository, teacherProfileRepository);
        teacher = new UsernamePasswordAuthenticationToken(
                "teacher@campuscore.local", null, List.of(new SimpleGrantedAuthority("TEACHER")));
    }

    @Test
    void teacherCanAccessStudentInAssignedClass() {
        Student student = student("student-1", "GRADE-10-A");
        TeacherProfile profile = new TeacherProfile();
        profile.setAssignedClassIds(List.of("GRADE-10-A"));
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(student));
        when(teacherProfileRepository.findByEmail("teacher@campuscore.local")).thenReturn(Optional.of(profile));

        assertEquals(student, service.requireStudentAccess(teacher, "student-1"));
    }

    @Test
    void teacherCannotAccessStudentOutsideAssignedClasses() {
        Student student = student("student-2", "GRADE-11-B");
        TeacherProfile profile = new TeacherProfile();
        profile.setAssignedClassIds(List.of("GRADE-10-A"));
        when(studentRepository.findById("student-2")).thenReturn(Optional.of(student));
        when(teacherProfileRepository.findByEmail("teacher@campuscore.local")).thenReturn(Optional.of(profile));

        assertThrows(ApiException.class, () -> service.requireStudentAccess(teacher, "student-2"));
    }

    private Student student(String id, String classId) {
        Student student = new Student();
        student.setId(id);
        student.setStudentClass(classId);
        return student;
    }
}
