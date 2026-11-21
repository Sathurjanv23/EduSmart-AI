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

import java.time.Instant;
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
import com.sms.backend.dto.PublishMarksRequest;
import com.sms.backend.dto.PublishMarksResponse;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Marks;
import com.sms.backend.model.Student;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.MarksService;
import com.sms.backend.service.StudentService;

/**
 * End-to-end integration and security assurance test for Feature 02:
 * Academic Marks Management and Publication Lifecycle.
 *
 * Validates the complete flow from teacher draft entry, publication gating,
 * immutable publication enforcement, to student and parent results isolation.
 */
@SpringBootTest
@AutoConfigureMockMvc
class MarksEndToEndIntegrationTest {

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

    // -------------------------------------------------------------
    // Step 3 & 6: Teacher Draft Entry, Isolation, and Privacy Tests
    // -------------------------------------------------------------

    @Test
    @DisplayName("Teacher saves valid draft with zero score (0/100) and draft remains hidden from student/parent")
    @WithMockUser(username = "teacher.math@school.test", authorities = "TEACHER")
    void teacherSavesDraftZeroScore_remainsHiddenUntilPublished() throws Exception {
        Student syntheticStudent = new Student();
        syntheticStudent.setId("synth-student-01");
        syntheticStudent.setName("Alice Walker");
        syntheticStudent.setStudentClass("GRADE-10-A");
        syntheticStudent.setParentEmail("parent.alice@school.test");

        Marks draftZero = new Marks();
        draftZero.setId("mark-synth-01");
        draftZero.setStudentId("synth-student-01");
        draftZero.setStudentName("Alice Walker");
        draftZero.setClassId("GRADE-10-A");
        draftZero.setSubject("Mathematics");
        draftZero.setMarks(0);
        draftZero.setTotalMarks(100);
        draftZero.setStatus("DRAFT");
        draftZero.setAssessmentType("CLASS_TEST");
        draftZero.setTerm("Term 1");

        MarksRequest request = new MarksRequest(
                "synth-student-01", "Mathematics", 0, 100, null, "CLASS_TEST", "Term 1", "Requires revision");

        when(studentService.requireEntity("synth-student-01")).thenReturn(syntheticStudent);
        when(marksService.addMarks(any(MarksRequest.class), eq("teacher.math@school.test"))).thenReturn(draftZero);

        // 1. Teacher posts draft mark
        mockMvc.perform(post("/api/marks")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("mark-synth-01"))
                .andExpect(jsonPath("$.marks").value(0))
                .andExpect(jsonPath("$.status").value("DRAFT"));

        verify(accessService).requireTeacherClass(any(), eq("GRADE-10-A"));
        verify(accessService).requireTeacherSubject(any(), eq("Mathematics"));
    }

    @Test
    @DisplayName("Teacher viewing class roster retrieves saved draft marks")
    @WithMockUser(username = "teacher.math@school.test", authorities = "TEACHER")
    void teacherViewsDraftMarksInRoster() throws Exception {
        Marks m1 = new Marks();
        m1.setId("m-draft-1");
        m1.setStudentId("synth-student-01");
        m1.setClassId("GRADE-10-A");
        m1.setSubject("Mathematics");
        m1.setMarks(75);
        m1.setTotalMarks(100);
        m1.setStatus("DRAFT");

        when(marksService.getMarksByClassAndSubject("GRADE-10-A", "Mathematics"))
                .thenReturn(List.of(m1));

        mockMvc.perform(get("/api/marks/class/GRADE-10-A/subject/Mathematics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m-draft-1"))
                .andExpect(jsonPath("$[0].marks").value(75))
                .andExpect(jsonPath("$[0].status").value("DRAFT"));
    }

    @Test
    @DisplayName("Unassigned teacher is denied access to class/subject worksheet with 403 Forbidden")
    @WithMockUser(username = "teacher.history@school.test", authorities = "TEACHER")
    void unassignedTeacherDeniedClassWorksheet() throws Exception {
        doThrow(ApiException.forbidden("This class is not assigned to the current teacher"))
                .when(accessService).requireTeacherClass(any(), eq("GRADE-11-C"));

        mockMvc.perform(get("/api/marks/class/GRADE-11-C/subject/Mathematics"))
                .andExpect(status().isForbidden());
    }

    // -------------------------------------------------------------
    // Step 4: Assessment Identity and Duplicate Resolution
    // -------------------------------------------------------------

    @Test
    @DisplayName("Assessment identity resolves custom assessmentId for multiple tests in same term")
    @WithMockUser(username = "teacher.math@school.test", authorities = "TEACHER")
    void assessmentIdentityResolvesMultipleTestsInSameTerm() throws Exception {
        Marks test1 = new Marks();
        test1.setId("m-ct1");
        test1.setAssessmentId("CLASS_TEST#Term 1#1");
        test1.setMarks(80);
        test1.setTotalMarks(100);

        when(marksService.getMarksByClassSubjectAndAssessment("GRADE-10-A", "Mathematics", "CLASS_TEST#Term 1#1"))
                .thenReturn(List.of(test1));

        mockMvc.perform(get("/api/marks/class/GRADE-10-A/subject/Mathematics")
                .param("assessmentId", "CLASS_TEST#Term 1#1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m-ct1"))
                .andExpect(jsonPath("$[0].assessmentId").value("CLASS_TEST#Term 1#1"));
    }

    // -------------------------------------------------------------
    // Step 5: Publication Lifecycle and Consistency Tests
    // -------------------------------------------------------------

    @Test
    @DisplayName("Publishing marks enforces roster completeness; rejects incomplete roster when allowPartial is false")
    @WithMockUser(username = "teacher.math@school.test", authorities = "TEACHER")
    void publishMarksIncompleteRosterRejectedWhenAllowPartialFalse() throws Exception {
        PublishMarksRequest request = new PublishMarksRequest(
                "GRADE-10-A", "Mathematics", null, null, "Term 1", "CLASS_TEST#Term 1", null, false);

        when(marksService.publishMarks(any(), eq("teacher.math@school.test")))
                .thenThrow(ApiException.badRequest("INCOMPLETE_ROSTER_MARKS",
                        "Cannot publish: 3 student(s) in class GRADE-10-A are missing marks. Complete all marks or enable partial publication."));

        mockMvc.perform(post("/api/marks/publish")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INCOMPLETE_ROSTER_MARKS"));
    }

    @Test
    @DisplayName("Partial publication succeeds when allowPartial is explicitly true")
    @WithMockUser(username = "teacher.math@school.test", authorities = "TEACHER")
    void publishMarksPartialAllowedSucceeds() throws Exception {
        PublishMarksRequest request = new PublishMarksRequest(
                "GRADE-10-A", "Mathematics", null, null, "Term 1", "CLASS_TEST#Term 1", null, true);

        PublishMarksResponse response = new PublishMarksResponse(
                "GRADE-10-A", "Mathematics", null, "CLASS_TEST#Term 1",
                2, 0, 2, List.of("m-1", "m-2"), List.of(), "Successfully published marks for 2 student(s)."
        );

        when(marksService.publishMarks(any(), eq("teacher.math@school.test"))).thenReturn(response);

        mockMvc.perform(post("/api/marks/publish")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publishedCount").value(2))
                .andExpect(jsonPath("$.alreadyPublishedCount").value(0));
    }

    @Test
    @DisplayName("Repeated publish request is idempotent: returns already published count without error")
    @WithMockUser(username = "teacher.math@school.test", authorities = "TEACHER")
    void repeatedPublishRequestIsIdempotent() throws Exception {
        PublishMarksRequest request = new PublishMarksRequest(
                "GRADE-10-A", "Mathematics", null, null, "Term 1", "CLASS_TEST#Term 1", null, true);

        PublishMarksResponse response = new PublishMarksResponse(
                "GRADE-10-A", "Mathematics", null, "CLASS_TEST#Term 1",
                0, 5, 5, List.of(), List.of("m-1", "m-2", "m-3", "m-4", "m-5"), "All targeted marks are already published."
        );

        when(marksService.publishMarks(any(), eq("teacher.math@school.test"))).thenReturn(response);

        mockMvc.perform(post("/api/marks/publish")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publishedCount").value(0))
                .andExpect(jsonPath("$.alreadyPublishedCount").value(5));
    }

    @Test
    @DisplayName("Updating already published marks is rejected with 409 Conflict (immutability)")
    @WithMockUser(username = "teacher.math@school.test", authorities = "TEACHER")
    void updatingPublishedMarksRejectedWithConflict() throws Exception {
        Marks existing = new Marks();
        existing.setId("mark-pub-01");
        existing.setClassId("GRADE-10-A");
        existing.setSubject("Mathematics");
        existing.setStatus("PUBLISHED");

        Student student = new Student();
        student.setId("synth-student-01");
        student.setStudentClass("GRADE-10-A");

        MarksRequest request = new MarksRequest(
                "synth-student-01", "Mathematics", 99, 100, null, "FINAL", "Term 3", "Attempted revision");

        when(marksService.requireById("mark-pub-01")).thenReturn(existing);
        when(studentService.requireEntity("synth-student-01")).thenReturn(student);
        when(marksService.updateMarks(eq("mark-pub-01"), any(), eq("teacher.math@school.test")))
                .thenThrow(ApiException.conflict("MARKS_ALREADY_PUBLISHED",
                        "Published marks cannot be modified directly. Unpublish first if revision is permitted."));

        mockMvc.perform(put("/api/marks/mark-pub-01")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("MARKS_ALREADY_PUBLISHED"));
    }

    // -------------------------------------------------------------
    // Step 6 & 7: Student and Parent Post-Publication Results Tests
    // -------------------------------------------------------------

    @Test
    @DisplayName("Authenticated student accesses own published marks via /api/marks/me")
    @WithMockUser(username = "alice@school.test", authorities = "STUDENT")
    void studentAccessesOwnPublishedMarks() throws Exception {
        Student alice = new Student();
        alice.setId("synth-student-01");
        alice.setName("Alice Walker");

        Marks pubMark = new Marks();
        pubMark.setId("m-pub-alice");
        pubMark.setStudentId("synth-student-01");
        pubMark.setSubject("Mathematics");
        pubMark.setMarks(92);
        pubMark.setTotalMarks(100);
        pubMark.setStatus("PUBLISHED");
        pubMark.setPublishedAt(Instant.now());

        when(accessService.currentStudent(any())).thenReturn(alice);
        when(marksService.getPublishedMarksByStudent("synth-student-01")).thenReturn(List.of(pubMark));

        mockMvc.perform(get("/api/marks/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m-pub-alice"))
                .andExpect(jsonPath("$[0].marks").value(92))
                .andExpect(jsonPath("$[0].status").value("PUBLISHED"));

        verify(marksService).getPublishedMarksByStudent("synth-student-01");
    }

    @Test
    @DisplayName("Linked parent accesses child's published marks via /api/marks/student/{id}")
    @WithMockUser(username = "parent.alice@school.test", authorities = "PARENT")
    void linkedParentAccessesChildPublishedMarks() throws Exception {
        Marks pubMark = new Marks();
        pubMark.setId("m-pub-alice");
        pubMark.setStudentId("synth-student-01");
        pubMark.setSubject("Mathematics");
        pubMark.setMarks(92);
        pubMark.setTotalMarks(100);
        pubMark.setStatus("PUBLISHED");

        when(accessService.hasAuthority(any(), eq("ADMIN"))).thenReturn(false);
        when(accessService.hasAuthority(any(), eq("TEACHER"))).thenReturn(false);
        when(marksService.getPublishedMarksByStudent("synth-student-01")).thenReturn(List.of(pubMark));

        mockMvc.perform(get("/api/marks/student/synth-student-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m-pub-alice"))
                .andExpect(jsonPath("$[0].marks").value(92));

        verify(accessService).requireStudentAccess(any(), eq("synth-student-01"));
        verify(marksService).getPublishedMarksByStudent("synth-student-01");
    }

    @Test
    @DisplayName("Unlinked parent accessing student marks is rejected with 403 Forbidden")
    @WithMockUser(username = "parent.other@school.test", authorities = "PARENT")
    void unlinkedParentAccessingStudentMarksRejected() throws Exception {
        doThrow(ApiException.forbidden("You may only access linked student records"))
                .when(accessService).requireStudentAccess(any(), eq("synth-student-01"));

        mockMvc.perform(get("/api/marks/student/synth-student-01"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student accessing another student's marks is rejected with 403 Forbidden")
    @WithMockUser(username = "bob@school.test", authorities = "STUDENT")
    void studentAccessingOtherStudentMarksRejected() throws Exception {
        doThrow(ApiException.forbidden("You may only access linked student records"))
                .when(accessService).requireStudentAccess(any(), eq("synth-student-01"));

        mockMvc.perform(get("/api/marks/student/synth-student-01"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to marks endpoints is rejected with 401 Unauthorized")
    void unauthenticatedRequestsRejected() throws Exception {
        mockMvc.perform(get("/api/marks/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/marks/student/synth-student-01"))
                .andExpect(status().isUnauthorized());
    }
}
