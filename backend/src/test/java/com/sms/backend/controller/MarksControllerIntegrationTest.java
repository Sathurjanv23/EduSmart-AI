package com.sms.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sms.backend.dto.MarksRequest;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Marks;
import com.sms.backend.model.Student;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.MarksService;
import com.sms.backend.service.StudentService;

@SpringBootTest
@AutoConfigureMockMvc
class MarksControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MarksService marksService;

    @MockitoBean
    private StudentService studentService;

    @MockitoBean
    private AcademicAccessService accessService;

    @Test
    @DisplayName("Unauthenticated request to GET /api/marks/me returns 401")
    void unauthenticatedMyMarksReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/marks/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Student viewing /api/marks/me returns only published marks")
    @WithMockUser(username = "student@school.test", authorities = "STUDENT")
    void studentViewsMyMarksReturnsPublishedMarks() throws Exception {
        Student student = new Student();
        student.setId("student-1");
        student.setName("Alice");

        Marks pubMark = new Marks();
        pubMark.setId("m-pub");
        pubMark.setMarks(88);
        pubMark.setTotalMarks(100);
        pubMark.setStatus("PUBLISHED");

        when(accessService.currentStudent(any())).thenReturn(student);
        when(marksService.getPublishedMarksByStudent("student-1")).thenReturn(List.of(pubMark));

        mockMvc.perform(get("/api/marks/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m-pub"))
                .andExpect(jsonPath("$[0].marks").value(88))
                .andExpect(jsonPath("$[0].status").value("PUBLISHED"));

        verify(marksService).getPublishedMarksByStudent("student-1");
    }

    @Test
    @DisplayName("Teacher viewing class/subject roster retrieves worksheet marks")
    @WithMockUser(username = "teacher@school.test", authorities = "TEACHER")
    void teacherViewsClassSubjectMarksWorksheet() throws Exception {
        Marks mark = new Marks();
        mark.setId("m-1");
        mark.setClassId("GRADE-10-A");
        mark.setSubject("Mathematics");
        mark.setMarks(90);
        mark.setTotalMarks(100);
        mark.setStatus("DRAFT");

        when(marksService.getMarksByClassAndSubject("GRADE-10-A", "Mathematics"))
                .thenReturn(List.of(mark));

        mockMvc.perform(get("/api/marks/class/GRADE-10-A/subject/Mathematics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m-1"))
                .andExpect(jsonPath("$[0].classId").value("GRADE-10-A"))
                .andExpect(jsonPath("$[0].subject").value("Mathematics"))
                .andExpect(jsonPath("$[0].status").value("DRAFT"));

        verify(accessService).requireTeacherClass(any(), eq("GRADE-10-A"));
        verify(accessService).requireTeacherSubject(any(), eq("Mathematics"));
    }

    @Test
    @DisplayName("Teacher unauthorized for class is rejected with 403 Forbidden")
    @WithMockUser(username = "teacher@school.test", authorities = "TEACHER")
    void teacherUnauthorizedForClassRejected() throws Exception {
        doThrow(ApiException.forbidden("This class is not assigned to the current teacher"))
                .when(accessService).requireTeacherClass(any(), eq("GRADE-12-Z"));

        mockMvc.perform(get("/api/marks/class/GRADE-12-Z/subject/Mathematics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Teacher unauthorized for subject is rejected with 403 Forbidden")
    @WithMockUser(username = "teacher@school.test", authorities = "TEACHER")
    void teacherUnauthorizedForSubjectRejected() throws Exception {
        doThrow(ApiException.forbidden("This subject is not assigned to the current teacher"))
                .when(accessService).requireTeacherSubject(any(), eq("Astrophysics"));

        mockMvc.perform(get("/api/marks/class/GRADE-10-A/subject/Astrophysics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Teacher adds valid marks with CSRF token")
    @WithMockUser(username = "teacher@school.test", authorities = "TEACHER")
    void teacherAddsMarksSuccess() throws Exception {
        Student student = new Student();
        student.setId("student-1");
        student.setStudentClass("GRADE-10-A");

        Marks created = new Marks();
        created.setId("m-new");
        created.setStudentId("student-1");
        created.setSubject("Mathematics");
        created.setMarks(80);
        created.setTotalMarks(100);
        created.setStatus("DRAFT");

        MarksRequest request = new MarksRequest(
                "student-1", "Mathematics", 80, 100, null, "CLASS_TEST", "Term 1", "Good effort");

        when(studentService.requireEntity("student-1")).thenReturn(student);
        when(marksService.addMarks(any(), eq("teacher@school.test"))).thenReturn(created);

        mockMvc.perform(post("/api/marks")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("m-new"))
                .andExpect(jsonPath("$.status").value("DRAFT"));

        verify(accessService).requireTeacherClass(any(), eq("GRADE-10-A"));
        verify(accessService).requireTeacherSubject(any(), eq("Mathematics"));
    }

    @Test
    @DisplayName("POST /api/marks without CSRF token is rejected with 403")
    @WithMockUser(username = "teacher@school.test", authorities = "TEACHER")
    void postMarksWithoutCsrfRejected() throws Exception {
        MarksRequest request = new MarksRequest("student-1", "Mathematics", 80, 100, null);

        mockMvc.perform(post("/api/marks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Teacher updates draft marks successfully")
    @WithMockUser(username = "teacher@school.test", authorities = "TEACHER")
    void teacherUpdatesDraftMarksSuccess() throws Exception {
        Marks existing = new Marks();
        existing.setId("m-existing");
        existing.setClassId("GRADE-10-A");
        existing.setSubject("Mathematics");
        existing.setStatus("DRAFT");

        Student student = new Student();
        student.setId("student-1");
        student.setStudentClass("GRADE-10-A");

        Marks updated = new Marks();
        updated.setId("m-existing");
        updated.setMarks(95);
        updated.setTotalMarks(100);

        MarksRequest request = new MarksRequest(
                "student-1", "Mathematics", 95, 100, null, "FINAL", "Term 3", "Outstanding");

        when(marksService.requireById("m-existing")).thenReturn(existing);
        when(studentService.requireEntity("student-1")).thenReturn(student);
        when(marksService.updateMarks(eq("m-existing"), any(), eq("teacher@school.test"))).thenReturn(updated);

        mockMvc.perform(put("/api/marks/m-existing")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("m-existing"))
                .andExpect(jsonPath("$.marks").value(95));
    }

    @Test
    @DisplayName("Student attempting to POST marks is denied with 403 Forbidden")
    @WithMockUser(username = "student@school.test", authorities = "STUDENT")
    void studentCannotPostMarks() throws Exception {
        MarksRequest request = new MarksRequest("student-1", "Mathematics", 100, 100, null);

        mockMvc.perform(post("/api/marks")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Parent accessing student marks receives only published results")
    @WithMockUser(username = "parent@school.test", authorities = "PARENT")
    void parentAccessesStudentMarksPublishedOnly() throws Exception {
        Marks pubMark = new Marks();
        pubMark.setId("m-pub");
        pubMark.setMarks(78);
        pubMark.setStatus("PUBLISHED");

        when(accessService.hasAuthority(any(), eq("ADMIN"))).thenReturn(false);
        when(accessService.hasAuthority(any(), eq("TEACHER"))).thenReturn(false);
        when(marksService.getPublishedMarksByStudent("child-1")).thenReturn(List.of(pubMark));

        mockMvc.perform(get("/api/marks/student/child-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m-pub"))
                .andExpect(jsonPath("$[0].marks").value(78));

        verify(accessService).requireStudentAccess(any(), eq("child-1"));
        verify(marksService).getPublishedMarksByStudent("child-1");
    }

    @Test
    @DisplayName("Admin accessing student marks receives all records including drafts")
    @WithMockUser(username = "admin@school.test", authorities = "ADMIN")
    void adminAccessesAllStudentMarks() throws Exception {
        Marks draftMark = new Marks();
        draftMark.setId("m-draft");
        draftMark.setMarks(60);
        draftMark.setStatus("DRAFT");

        when(accessService.hasAuthority(any(), eq("ADMIN"))).thenReturn(true);
        when(marksService.getMarksByStudent("student-1")).thenReturn(List.of(draftMark));

        mockMvc.perform(get("/api/marks/student/student-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m-draft"))
                .andExpect(jsonPath("$[0].marks").value(60));

        verify(accessService).requireStudentAccess(any(), eq("student-1"));
        verify(marksService).getMarksByStudent("student-1");
    }
}
