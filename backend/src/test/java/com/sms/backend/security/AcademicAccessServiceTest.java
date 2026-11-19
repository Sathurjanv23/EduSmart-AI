package com.sms.backend.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
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
    private Authentication admin;
    private Authentication teacher;
    private Authentication student;
    private Authentication parent;

    @BeforeEach
    void setUp() {
        service = new AcademicAccessService(studentRepository, teacherProfileRepository);
        admin = new UsernamePasswordAuthenticationToken(
                "admin@campuscore.local", null, List.of(new SimpleGrantedAuthority("ADMIN")));
        teacher = new UsernamePasswordAuthenticationToken(
                "teacher@campuscore.local", null, List.of(new SimpleGrantedAuthority("TEACHER")));
        student = new UsernamePasswordAuthenticationToken(
                "student@campuscore.local", null, List.of(new SimpleGrantedAuthority("STUDENT")));
        parent = new UsernamePasswordAuthenticationToken(
                "parent@campuscore.local", null, List.of(new SimpleGrantedAuthority("PARENT")));
    }

    @Test
    void adminCanAccessAnyStudent() {
        Student studentEntity = student("student-1", "GRADE-10-A", "student@campuscore.local", "parent@campuscore.local");
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(studentEntity));

        assertEquals(studentEntity, service.requireStudentAccess(admin, "student-1"));
    }

    @Test
    void teacherCanAccessStudentInAssignedClass() {
        Student studentEntity = student("student-1", "GRADE-10-A", "student@campuscore.local", "parent@campuscore.local");
        TeacherProfile profile = new TeacherProfile();
        profile.setAssignedClassIds(List.of("GRADE-10-A"));
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(studentEntity));
        when(teacherProfileRepository.findByEmail("teacher@campuscore.local")).thenReturn(Optional.of(profile));

        assertEquals(studentEntity, service.requireStudentAccess(teacher, "student-1"));
    }

    @Test
    void teacherCannotAccessStudentOutsideAssignedClasses() {
        Student studentEntity = student("student-2", "GRADE-11-B", "student2@campuscore.local", "parent2@campuscore.local");
        TeacherProfile profile = new TeacherProfile();
        profile.setAssignedClassIds(List.of("GRADE-10-A"));
        when(studentRepository.findById("student-2")).thenReturn(Optional.of(studentEntity));
        when(teacherProfileRepository.findByEmail("teacher@campuscore.local")).thenReturn(Optional.of(profile));

        assertThrows(ApiException.class, () -> service.requireStudentAccess(teacher, "student-2"));
    }

    @Test
    void studentCanAccessOwnRecord() {
        Student studentEntity = student("student-1", "GRADE-10-A", "student@campuscore.local", "parent@campuscore.local");
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(studentEntity));

        assertEquals(studentEntity, service.requireStudentAccess(student, "student-1"));
    }

    @Test
    void studentCannotAccessOtherStudentRecord() {
        Student otherStudent = student("student-2", "GRADE-10-A", "other@campuscore.local", "parent@campuscore.local");
        when(studentRepository.findById("student-2")).thenReturn(Optional.of(otherStudent));

        assertThrows(ApiException.class, () -> service.requireStudentAccess(student, "student-2"));
    }

    @Test
    void parentCanAccessLinkedChild() {
        Student child = student("student-1", "GRADE-10-A", "student@campuscore.local", "parent@campuscore.local");
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(child));

        assertEquals(child, service.requireStudentAccess(parent, "student-1"));
    }

    @Test
    void parentCannotAccessUnlinkedStudent() {
        Student unlinked = student("student-2", "GRADE-10-A", "student2@campuscore.local", "other-parent@campuscore.local");
        when(studentRepository.findById("student-2")).thenReturn(Optional.of(unlinked));

        assertThrows(ApiException.class, () -> service.requireStudentAccess(parent, "student-2"));
    }

    @Test
    void requireAdminAllowsAdminAndRejectsOthers() {
        assertDoesNotThrow(() -> service.requireAdmin(admin));
        assertThrows(ApiException.class, () -> service.requireAdmin(teacher));
        assertThrows(ApiException.class, () -> service.requireAdmin(student));
        assertThrows(ApiException.class, () -> service.requireAdmin(parent));
    }

    @Test
    void requireStaffAllowsAdminAndTeacher() {
        assertDoesNotThrow(() -> service.requireStaff(admin));
        assertDoesNotThrow(() -> service.requireStaff(teacher));
        assertThrows(ApiException.class, () -> service.requireStaff(student));
        assertThrows(ApiException.class, () -> service.requireStaff(parent));
    }

    @Test
    void requireTeacherClassAllowsAssignedClass() {
        assertDoesNotThrow(() -> service.requireTeacherClass(admin, "GRADE-10-A"));

        TeacherProfile profile = new TeacherProfile();
        profile.setAssignedClassIds(List.of("GRADE-10-A"));
        when(teacherProfileRepository.findByEmail("teacher@campuscore.local")).thenReturn(Optional.of(profile));

        assertDoesNotThrow(() -> service.requireTeacherClass(teacher, "GRADE-10-A"));
        assertThrows(ApiException.class, () -> service.requireTeacherClass(teacher, "GRADE-11-B"));
        assertThrows(ApiException.class, () -> service.requireTeacherClass(teacher, ""));
    }

    @Test
    void requireTeacherSubjectAllowsAssignedSubject() {
        assertDoesNotThrow(() -> service.requireTeacherSubject(admin, "Mathematics"));

        TeacherProfile profile = new TeacherProfile();
        profile.setAssignedSubjects(List.of("Mathematics", "Science"));
        when(teacherProfileRepository.findByEmail("teacher@campuscore.local")).thenReturn(Optional.of(profile));

        assertDoesNotThrow(() -> service.requireTeacherSubject(teacher, "mathematics"));
        assertDoesNotThrow(() -> service.requireTeacherSubject(teacher, "SCIENCE"));
        assertThrows(ApiException.class, () -> service.requireTeacherSubject(teacher, "History"));
        assertThrows(ApiException.class, () -> service.requireTeacherSubject(teacher, ""));
    }

    @Test
    void requireClassReadAccessValidatesPerRole() {
        assertDoesNotThrow(() -> service.requireClassReadAccess(admin, "GRADE-10-A"));

        TeacherProfile profile = new TeacherProfile();
        profile.setAssignedClassIds(List.of("GRADE-10-A"));
        when(teacherProfileRepository.findByEmail("teacher@campuscore.local")).thenReturn(Optional.of(profile));
        assertDoesNotThrow(() -> service.requireClassReadAccess(teacher, "GRADE-10-A"));
        assertThrows(ApiException.class, () -> service.requireClassReadAccess(teacher, "GRADE-11-B"));

        Student studentEntity = student("student-1", "GRADE-10-A", "student@campuscore.local", "parent@campuscore.local");
        when(studentRepository.findByEmail("student@campuscore.local")).thenReturn(Optional.of(studentEntity));
        assertDoesNotThrow(() -> service.requireClassReadAccess(student, "GRADE-10-A"));
        assertThrows(ApiException.class, () -> service.requireClassReadAccess(student, "GRADE-11-B"));

        when(studentRepository.findByParentEmail("parent@campuscore.local")).thenReturn(List.of(studentEntity));
        assertDoesNotThrow(() -> service.requireClassReadAccess(parent, "GRADE-10-A"));
        assertThrows(ApiException.class, () -> service.requireClassReadAccess(parent, "GRADE-11-B"));
    }

    private Student student(String id, String classId, String email, String parentEmail) {
        Student student = new Student();
        student.setId(id);
        student.setStudentClass(classId);
        student.setEmail(email);
        student.setParentEmail(parentEmail);
        return student;
    }
}
