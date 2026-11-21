# Feature 02.1: Secure Academic Marks Backend Foundation

## 1. Overview & Objectives

Feature 02 introduces **Teacher Marks Entry & Academic Grading** for the CampusCore application.
Task 02.1 establishes the foundational backend marks domain, server-side authorization controls, input validations, duplicate prevention, and privacy-preserving retrieval APIs required before building the Teacher Marks Entry UI (Task 02.2) and Draft/Publishing workflow (Task 02.3).

---

## 2. Existing vs. Newly Implemented Functionality

| Capability | Prior State (Feature 01) | New State (Feature 02.1) | Status |
| :--- | :--- | :--- | :--- |
| **Marks Model Attributes** | Basic fields (`marks`, `totalMarks`, `subject`, `studentId`, `classId`, `examId`) | Added `status` (`DRAFT`/`PUBLISHED`), `publishedAt`, `publishedBy`, `assessmentType`, `term`, `comments` | **Enhanced** |
| **Duplicate Prevention** | No compound index or duplicate validation; same student/exam could be submitted multiple times | Added `@CompoundIndex` on `(studentId, subject, examId)` (unique, sparse) and service-level duplicate checks | **Implemented** |
| **Exam Maximum Constraint** | Verified exam class and subject match only | Additionally verifies `request.totalMarks <= exam.totalMarks` to prevent over-allocation | **Implemented** |
| **Teacher Roster Query** | Only `findByStudentId` and `findByClassId` existed; no class+subject worksheet endpoint | Added `GET /api/marks/class/{classId}/subject/{subject}` with optional `?examId=...` filter | **Implemented** |
| **Student/Parent Privacy** | `GET /api/marks/me` and `GET /api/marks/student/{id}` returned all marks including unfinished evaluations | `GET /api/marks/me` and parent lookups return **only published marks** (`status=PUBLISHED`); draft marks are hidden | **Secured** |
| **Draft Immutability** | Any record could be updated repeatedly | Records with `status=PUBLISHED` reject direct updates (`409 Conflict`), requiring formal revision | **Implemented** |
| **CSRF Enforcement** | Cookie-authenticated state-changing calls enforce CSRF | Validated across `POST /api/marks` and `PUT /api/marks/{id}` | **Verified** |

---

## 3. Domain Model Architecture

### 3.1 Numeric Precision Choice
- **Academic Marks Representation:** Marks (`marks`) and total marks (`totalMarks`) are strictly modeled as **non-negative 32-bit Integers (`int`)**.
- **Rationale:** Standard academic grading in school systems (CampusCore) evaluates assessments in whole marks/points. Integer arithmetic eliminates IEEE 754 floating-point inaccuracies, rounding drifts, and binary representation quirks during ranking, percentage calculations, or aggregation.

### 3.2 Data Model Structure (`Marks.java`)
```java
@Document(collection = "marks")
@CompoundIndexes({
    @CompoundIndex(name = "idx_marks_class_subject", def = "{'classId': 1, 'subject': 1}"),
    @CompoundIndex(name = "idx_marks_student_subject_exam", def = "{'studentId': 1, 'subject': 1, 'examId': 1}", unique = true, sparse = true)
})
public class Marks {
    @Id private String id;
    @Indexed private String studentId;
    private String studentName;
    @Indexed private String parentEmail;
    @Indexed private String classId;
    @Indexed private String examId;
    @Indexed private String subject;
    private String assessmentType;   // TERM_TEST, MID_TERM, FINAL, CLASS_TEST, ASSIGNMENT, OTHER
    private String term;             // e.g. "Term 1", "2026-T1"
    private int marks;               // Obtained marks (>= 0)
    private int totalMarks;          // Maximum marks (> 0)
    private String comments;         // Teacher feedback / notes
    @Indexed private String status;  // DRAFT or PUBLISHED
    private Instant publishedAt;
    private String publishedBy;
    private Instant recordedAt;
    private String recordedBy;
    private Instant updatedAt;
}
```

---

## 4. API Endpoint Matrix

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/marks` | `TEACHER`, `ADMIN` | Record marks for a student. Validates teacher assignments for class and subject. Enforces CSRF. Defaults to `status=DRAFT`. |
| `PUT` | `/api/marks/{id}` | `TEACHER`, `ADMIN` | Update an existing draft mark. Cannot modify published marks directly. Enforces CSRF. |
| `GET` | `/api/marks` | `ADMIN` | Administrative access to view all marks across the institution. |
| `GET` | `/api/marks/me` | `STUDENT` | Authenticated student portal. **Returns only published marks**. |
| `GET` | `/api/marks/student/{id}` | `STUDENT`, `PARENT`, `TEACHER`, `ADMIN` | Returns student marks. For students and parents, **returns only published marks**. For teachers and admins, returns full records including drafts. |
| `GET` | `/api/marks/class/{classId}/subject/{subject}` | `TEACHER`, `ADMIN` | Teacher grading worksheet roster. Retrieves marks for assigned class and subject, optionally filtered by `?examId=...`. |

---

## 5. Security & Authorization Rules

1. **Role-Based Principal Verification:** All requests determine the caller identity from the authenticated security context (`Authentication.getName()`), never client-supplied author IDs.
2. **Teacher Class & Subject Constraints:**
   - Teachers may only enter or query marks for classes assigned in their `TeacherProfile.assignedClassIds`.
   - Teachers may only evaluate subjects in their `TeacherProfile.assignedSubjects`.
   - Admin principals bypass class assignment restrictions but must respect all validation and integrity rules.
3. **Student Self-Access Only:** Students can only query their own ID. Attempts to query other students result in `403 Forbidden`.
4. **Parent-Child Linkage:** Parents can only query marks for students where `student.parentEmail` matches their principal. Attempts to access non-linked students produce `403 Forbidden`.
5. **IDOR & Enumeration Defense:**
   - Authorization checks occur before reading or updating marks records.
   - Non-existent resource lookups produce consistent 404 responses without leaking student information.
6. **CSRF Protection:** State-changing requests (`POST`, `PUT`) require valid `X-XSRF-TOKEN` session cookies.

---

## 6. Validation Rules

- **Obtained Marks:** Must be `0 <= marks <= totalMarks`.
- **Total Marks:** Must be `1 <= totalMarks <= 100000`.
- **Assessment Type:** Must be one of `TERM_TEST`, `MID_TERM`, `FINAL`, `CLASS_TEST`, `ASSIGNMENT`, `OTHER` (or null for continuous evaluations).
- **Exam Linkage:** When `examId` is specified:
  - Referenced exam must exist.
  - Exam's `classId` must match the student's class.
  - Exam's `subject` must match the marks subject (case-insensitive).
  - Assessment `totalMarks` cannot exceed the exam's configured maximum marks.
- **Duplicate Prevention:** Rejects duplicate entries for the same student, subject, and exam combination (`409 Conflict`).

---

## 7. Automated Test Evidence

Automated test suites were developed and verified:

1. **Service & Domain Tests (`AttendanceAndMarksServiceTest.java`):**
   - Marks cannot exceed total marks (`400 Bad Request`).
   - Marks cannot be negative (`400 Bad Request`).
   - Total marks cannot be zero or negative (`400 Bad Request`).
   - Valid marks creation defaults to `status="DRAFT"`.
   - Exam ownership mismatch rejection (`EXAM_OWNERSHIP_MISMATCH`).
   - Total marks exceeding exam limit rejection (`TOTAL_MARKS_EXCEEDS_EXAM`).
   - Duplicate exam marks conflict rejection (`DUPLICATE_MARKS_RECORD`).
   - Published marks direct update rejection (`MARKS_ALREADY_PUBLISHED`).
   - Draft marks update success.
   - Published marks filter verification.

2. **Controller & Authorization Integration Tests (`MarksControllerIntegrationTest.java`):**
   - Unauthenticated `GET /api/marks/me` rejected (`401 Unauthorized`).
   - Student accessing `GET /api/marks/me` receives only published marks.
   - Teacher viewing class/subject roster retrieves marks worksheet.
   - Teacher unauthorized for class denied (`403 Forbidden`).
   - Teacher unauthorized for subject denied (`403 Forbidden`).
   - Teacher adding valid marks with CSRF succeeds (`200 OK`).
   - Write without CSRF rejected (`403 Forbidden`).
   - Teacher updating draft marks succeeds (`200 OK`).
   - Student attempting to POST marks denied (`403 Forbidden`).
   - Parent accessing student marks receives only published results.
   - Admin accessing student marks receives full records including drafts.

---

## 8. Remaining Roadmap

- **Task 02.2 (Teacher Marks UI):** Implement Next.js teacher grading worksheet connecting to `GET /api/marks/class/{classId}/subject/{subject}`, class/student rosters, and `POST /api/marks`.
- **Task 02.3 (Draft & Publishing):** Add explicit batch publishing endpoints, publication confirmation, audit trails, and concurrency protections.
- **Task 02.4 (Student & Parent Results):** Display published assessments in student and parent portals.
- **Task 02.5 (Integration & Verification):** End-to-end full academic cycle tests and documentation updates.
