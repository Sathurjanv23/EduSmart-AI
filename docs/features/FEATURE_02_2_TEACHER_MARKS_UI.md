# Feature 02.2: Teacher Marks Entry Workspace

## 1. Executive Summary

Feature 02.2 delivers a responsive, API-backed **Teacher Marks Entry Workspace** (`/teacher/marks`) for the CampusCore application.
It integrates directly with the secure backend endpoints established in Feature 02.1 (`MarksController`, `AcademicAccessService`, `MarksService`) to enable teachers to select their authorized teaching assignments, inspect their enrolled student rosters, record academic marks, and persist drafts without bypassing access controls or leaking unassigned data.

---

## 2. New Route & Navigation

- **Primary Route:** `/teacher/marks`
- **Protected Layout:** Wrapped in `RoleGuard allowedRoles={["TEACHER"]}` and `ErpLayout`.
- **Sidebar Navigation:** Added **Marks Entry** (`/teacher/marks` with icon `Award`) under the **Class Management** navigation group in `components/ErpLayout.tsx`.
- **Dashboard Quick Link:** Added quick-action metric card on `/teacher/dashboard` linking directly to `/teacher/marks`.

---

## 3. UI/UX Architecture & Capabilities

### 3.1 Context Selection Bar
1. **Assigned Class Selector:** Populated strictly from `GET /api/teacher/profile` (`profile.assignedClassIds`). Classes not assigned to the authenticated teacher are never displayed.
2. **Assigned Subject Selector:** Populated strictly from `profile.assignedSubjects`.
3. **Assessment / Exam Selector:** Dynamically loaded via `GET /api/exams/class/{classId}` for the selected class. Teachers can choose between:
   - Specific structured exams (e.g., Mid-Term Exam, Final Exam with linked maximum marks).
   - General class assessments (e.g., Class Test, Quizzes, Continuous Evaluation).
4. **Assessment Category:** For general assessments, categorizes the evaluation into `CLASS_TEST`, `MID_TERM`, `TERM_TEST`, `FINAL`, `ASSIGNMENT`, or `OTHER`.

### 3.2 Live Student Roster Worksheet
- **Real Roster Retrieval:** Loads students for the selected class using `GET /api/teacher/classes/{classId}/students`.
- **Deterministic Sort:** The student roster is kept stable, sorted alphabetically by student name to prevent cursor jumps during data entry.
- **Marks Reconciliation:** Calls `GET /api/marks/class/{classId}/subject/{subject}?examId=...` on load to pre-populate any previously saved draft marks for each student.
- **Roster Search:** Live client-side search input allows filtering students by name or email.

### 3.3 Draft Entry & Validation
- **Integer Enforcement:** Requires integer marks matching backend specifications, eliminating IEEE 754 precision drift.
- **Zero-Mark Support:** Clearly distinguishes zero (`0`) from unentered empty fields (`""`).
- **Range Constraints:** Disallows negative scores (`< 0`) and scores exceeding the assessment maximum (`> totalMarks`).
- **Row-Level Feedback:** Highlights individual input fields with immediate visual error notices when an invalid score is entered.
- **Draft Status Indicators:**
  - `Not Saved`: Unmodified or unsaved student row.
  - `Draft Saved`: Persisted in MongoDB as a draft evaluation.
  - `Published`: Immutable evaluation record; inputs are locked to prevent editing published results.
- **Unsaved Changes Warning:** Prompts confirmation if the teacher attempts to switch class, subject, or assessment while unsaved row modifications exist.

### 3.4 Safe Batch Persistence
- Identifies modified ("dirty") rows and sends individual authenticated `POST` (new entry) or `PUT` (existing draft entry) requests.
- Handles partial network or validation failures gracefully, retaining dirty rows that failed while updating successfully saved rows.
- Displays clear success, partial success, or failure notifications.

---

## 4. Frontend API Integrations (`marksService.ts`)

| Function | Endpoint | Method | Purpose |
| :--- | :--- | :--- | :--- |
| `getMarksByClassAndSubject(classId, subject, examId?)` | `/api/marks/class/{classId}/subject/{subject}` | `GET` | Fetches evaluated marks for the teacher's class and subject. |
| `addMarks(payload)` | `/api/marks` | `POST` | Records a new draft mark for an enrolled student. |
| `updateMarks(id, payload)` | `/api/marks/{id}` | `PUT` | Updates an existing draft mark. |
| `getMyMarks()` | `/api/marks/me` | `GET` | Student portal lookup (published only). |
| `getMarksByStudent(studentId)` | `/api/marks/student/{studentId}` | `GET` | Student/parent scoped lookup. |

---

## 5. Security & Authorization Guarantees

1. **HttpOnly Cookie Authentication:** All API requests carry authenticated session cookies (`withCredentials: true`). No JWTs or sensitive credentials are stored in `localStorage` or `sessionStorage`.
2. **CSRF Protection:** Mutating requests (`POST`, `PUT`) automatically attach the `X-XSRF-TOKEN` header via the central axios client (`apiService.ts`).
3. **No Frontend Authorization Spoofing:** Even if a malicious actor attempted to send an arbitrary `classId` or `subject`, the backend's `AcademicAccessService` strictly validates teacher assignments on the server side and responds with `403 Forbidden`.
4. **Privacy Isolation:** Student and parent portals are shielded from draft evaluations; only published marks are exposed.

---

## 6. Automated Testing Evidence

1. **Marks Service API Unit Tests (`app/services/marksService.test.ts`):**
   - URL construction for class/subject query without exam filter.
   - URL encoding for query with optional `examId`.
   - `addMarks` POST request validation and payload correctness.
   - `updateMarks` PUT request validation.
   - `getMyMarks` and `getMarksByStudent` client calls.
2. **Worksheet Validation Logic Unit Tests (`app/teacher/marks/marksValidation.test.ts`):**
   - Acceptance of integer values including `0`.
   - Rejection of negative numbers.
   - Rejection of floating point decimals.
   - Rejection of values exceeding assessment total.
   - Class average percentage calculation.
   - Unsaved dirty row and publish lock identification.
3. **Full Quality Gates:**
   - Frontend lint: **0 warnings, 0 errors**.
   - Frontend typecheck: **0 errors**.
   - Vitest suite: **26/26 tests passed** across 7 test suites.
   - Frontend build: **47/47 static pages generated**.
   - Backend Maven tests: **157/157 tests passed**.
   - ML service pytest: **11/11 tests passed**.

---

## 7. Remaining Work (Feature 02 Roadmap)

- **Task 02.3 (Draft & Publishing Workflow):** Explicit Publish Results button, batch publication verification, unpublish workflow, and duplicate-submission concurrency protections.
- **Task 02.4 (Student & Parent Results):** Display published assessments in student and parent portals with summaries, analytics, and printable report cards.
- **Task 02.5 (Integration, QA & Documentation):** End-to-end full academic cycle tests from teacher entry through parent visibility.
