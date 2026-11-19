package com.sms.backend.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAuthorizationCharacterizationTest {

    @Autowired
    private MockMvc mockMvc;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.sms.backend.service.StudentService studentService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.sms.backend.repository.AssignmentSubmissionRepository assignmentSubmissionRepository;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.sms.backend.repository.AssignmentRepository assignmentRepository;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.sms.backend.repository.AnnouncementRepository announcementRepository;

    @Nested
    @DisplayName("Public and Anonymous Endpoints")
    class PublicEndpoints {
        @Test
        void healthEndpointIsPublicWithoutAuth() throws Exception {
            // Reaches actuator health without authentication; returns 503 in test environment without live MongoDB
            mockMvc.perform(get("/actuator/health"))
                    .andExpect(status().isServiceUnavailable());
        }

        @Test
        void loginReachesControllerWithoutToken() throws Exception {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void signupReachesControllerWithoutToken() throws Exception {
            mockMvc.perform(post("/api/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        void anonymousRequestsToProtectedEndpointsReturnUnauthorized() throws Exception {
            mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
            mockMvc.perform(get("/api/admin/dashboard")).andExpect(status().isUnauthorized());
            mockMvc.perform(get("/api/teacher/classes")).andExpect(status().isUnauthorized());
            mockMvc.perform(get("/api/students/me")).andExpect(status().isUnauthorized());
            mockMvc.perform(get("/api/parents/children")).andExpect(status().isUnauthorized());
            mockMvc.perform(post("/api/upload")).andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Admin Scope Authorization")
    class AdminScope {
        @Test
        @WithMockUser(authorities = "ADMIN")
        void adminCanAccessAdminDashboard() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotAccessAdminDashboard() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotAccessAdminDashboard() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "PARENT")
        void parentCannotAccessAdminDashboard() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotCreateUsers() throws Exception {
            mockMvc.perform(post("/api/admin/users")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"name":"Test","email":"test@example.test","password":"Strong!Pass123","role":"STUDENT"}
                                    """))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Student Resource Authorization")
    class StudentScope {
        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotCreateStudent() throws Exception {
            mockMvc.perform(post("/api/students")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"name":"Student","email":"s@example.test","parentEmail":"p@example.test","studentClass":"GRADE-10-A"}
                                    """))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotCreateStudent() throws Exception {
            mockMvc.perform(post("/api/students")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotDeleteStudent() throws Exception {
            mockMvc.perform(delete("/api/students/student-1"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotListAllStudentsDueToControllerGuard() throws Exception {
            mockMvc.perform(get("/api/students"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotListAllStudentsDueToControllerGuard() throws Exception {
            mockMvc.perform(get("/api/students"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "PARENT")
        void parentCannotListAllStudentsDueToControllerGuard() throws Exception {
            mockMvc.perform(get("/api/students"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Academic Operations Authorization")
    class AcademicOperations {
        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotMarkAttendance() throws Exception {
            mockMvc.perform(post("/api/attendance")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "PARENT")
        void parentCannotMarkAttendance() throws Exception {
            mockMvc.perform(post("/api/attendance")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotAddMarks() throws Exception {
            mockMvc.perform(post("/api/marks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "PARENT")
        void parentCannotAddMarks() throws Exception {
            mockMvc.perform(post("/api/marks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotCreateAssignment() throws Exception {
            mockMvc.perform(post("/api/assignments")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotSubmitAssignment() throws Exception {
            mockMvc.perform(post("/api/assignments/submissions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotGradeSubmission() throws Exception {
            mockMvc.perform(patch("/api/assignments/submissions/sub-1/grade")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"marks":100,"feedback":"Good"}
                                    """))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Fees & Finance Authorization")
    class FinanceScope {
        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotAccessFeeTransactions() throws Exception {
            mockMvc.perform(get("/api/fee-transactions"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotRecordPayment() throws Exception {
            mockMvc.perform(post("/api/fee-transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotRecordPayment() throws Exception {
            mockMvc.perform(post("/api/fee-transactions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotCreateFeeStructure() throws Exception {
            mockMvc.perform(post("/api/fee-structure")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("ML Service and File Upload Authorization")
    class MlAndUploadScope {
        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotPredictRawMl() throws Exception {
            mockMvc.perform(post("/api/ml/predict")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "PARENT")
        void parentCannotPredictRawMl() throws Exception {
            mockMvc.perform(post("/api/ml/predict")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotPredictStudentRisk() throws Exception {
            mockMvc.perform(post("/api/ml/students/student-1/predict"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotUploadMultipleFiles() throws Exception {
            mockMvc.perform(post("/api/upload/multiple"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotDeleteUploadedFile() throws Exception {
            mockMvc.perform(delete("/api/upload/00000000-0000-0000-0000-000000000000.pdf"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotDeleteUploadedFile() throws Exception {
            mockMvc.perform(delete("/api/upload/00000000-0000-0000-0000-000000000000.pdf"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Default Deny Authorization")
    class DefaultDenyScope {
        @Test
        @WithMockUser(authorities = "STUDENT")
        void undefinedEndpointIsDeniedForStudent() throws Exception {
            mockMvc.perform(get("/api/nonexistent-route"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void undefinedEndpointIsDeniedForTeacher() throws Exception {
            mockMvc.perform(get("/api/nonexistent-route"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Tightened Student and Academic List Endpoints")
    class AcademicListEndpointsScope {
        @Test
        @WithMockUser(authorities = "ADMIN")
        void adminCanAccessStudentList() throws Exception {
            mockMvc.perform(get("/api/students"))
                    .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotAccessStudentList() throws Exception {
            mockMvc.perform(get("/api/students"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotAccessStudentList() throws Exception {
            mockMvc.perform(get("/api/students"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "PARENT")
        void parentCannotAccessStudentList() throws Exception {
            mockMvc.perform(get("/api/students"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotAccessStudentPage() throws Exception {
            mockMvc.perform(get("/api/students/page"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotAccessStudentPage() throws Exception {
            mockMvc.perform(get("/api/students/page"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "PARENT")
        void parentCannotAccessStudentPage() throws Exception {
            mockMvc.perform(get("/api/students/page"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotAccessAllAttendance() throws Exception {
            mockMvc.perform(get("/api/attendance"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotAccessAllAttendance() throws Exception {
            mockMvc.perform(get("/api/attendance"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotAccessAllMarks() throws Exception {
            mockMvc.perform(get("/api/marks"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotAccessAllMarks() throws Exception {
            mockMvc.perform(get("/api/marks"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("Private File Downloads Authorization")
    class PrivateFileDownloadsScope {
        @Test
        void anonymousCannotDownloadUploads() throws Exception {
            mockMvc.perform(get("/uploads/550e8400-e29b-41d4-a716-446655440000.pdf"))
                    .andExpect(status().isUnauthorized());
            mockMvc.perform(get("/api/uploads/550e8400-e29b-41d4-a716-446655440000.pdf"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithMockUser(authorities = "STUDENT")
        void studentCannotDownloadUnreferencedFile() throws Exception {
            mockMvc.perform(get("/uploads/550e8400-e29b-41d4-a716-446655440000.pdf"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "TEACHER")
        void teacherCannotDownloadUnreferencedFile() throws Exception {
            mockMvc.perform(get("/uploads/550e8400-e29b-41d4-a716-446655440000.pdf"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "PARENT")
        void parentCannotDownloadUnreferencedFile() throws Exception {
            mockMvc.perform(get("/uploads/550e8400-e29b-41d4-a716-446655440000.pdf"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "ADMIN")
        void nonGetRequestsOnUploadsPathAreDenied() throws Exception {
            mockMvc.perform(post("/uploads/550e8400-e29b-41d4-a716-446655440000.pdf"))
                    .andExpect(status().isForbidden());
            mockMvc.perform(delete("/uploads/550e8400-e29b-41d4-a716-446655440000.pdf"))
                    .andExpect(status().isForbidden());
        }
    }
}
