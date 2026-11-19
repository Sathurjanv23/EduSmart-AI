# Feature 01.2 Academic Access-Control Hardening

**Date:** November 2026  
**Lead Engineer:** Sathu  
**Repository:** [EduSmart-AI](https://github.com/Sathurjanv23/EduSmart-AI)  
**Branch:** `feature/01-2-access-control`  
**Base Commit:** `e626b82` (PR #2 merge commit into `main`)

---

## 1. Overview & Objectives

Task 01.2 hardens academic record-level access control and eliminates unauthorized cross-user file download vulnerabilities in EduSmart-AI (CampusCore).

Prior to this task:
1. `GET /api/students/**` in `SecurityConfig.java` allowed all authenticated roles (`ADMIN`, `TEACHER`, `STUDENT`, `PARENT`) at the filter level. Although the controller guarded `getAllStudents` and `getStudentsPage`, the filter matcher order permitted broad access.
2. `WebConfig.java` statically mapped `/uploads/**` directly to disk (`addResourceHandlers`) with a 3600-second browser cache and no record-level ownership check. Any authenticated user who obtained or guessed a file UUID could download confidential student submissions, exam materials, and personal files.
3. Administrative operations in `StudentController`, `FeeStructureController`, `FeeTransactionController`, and `FileUploadController` relied solely on HTTP security filters without redundant controller-level defense-in-depth guards.

---

## 2. API Access Matrix: Before vs. After

| Route / Method | Previous Access (HTTP Filter) | Hardened Access (Filter + Controller) | Notes |
|---|---|---|---|
| `GET /api/students` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | **`ADMIN` ONLY** | Root student directory enumeration blocked at filter & controller |
| `GET /api/students/page` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | **`ADMIN` ONLY** | Paginated student list restricted to Admin |
| `GET /api/students/me` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | `ADMIN`, `STUDENT` | Authenticated student self-profile lookup |
| `GET /api/students/parent` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | `ADMIN`, `PARENT` | Parent scoped access to linked children |
| `GET /api/students/class/{classId}` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | `ADMIN`, `TEACHER` | Teacher scoped access to assigned class roster |
| `GET /api/students/{id}` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | Controller checks `requireStudentAccess` (assigned teacher, linked parent, self student) |
| `POST / PUT / DELETE /api/students/**` | `ADMIN` (Filter only) | `ADMIN` (Filter + Controller) | Controller-level `requireAdmin` defense-in-depth |
| `GET /api/attendance` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | **`ADMIN` ONLY** | School-wide attendance listing blocked for non-admins |
| `GET /api/attendance/me` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | `ADMIN`, `STUDENT` | Student self-attendance lookup |
| `GET /api/attendance/student/{id}` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | Scoped via `requireStudentAccess` |
| `GET /api/marks` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | **`ADMIN` ONLY** | School-wide marks listing blocked for non-admins |
| `GET /api/marks/me` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | `ADMIN`, `STUDENT` | Student self-marks lookup |
| `GET /api/marks/student/{id}` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | `ADMIN`, `TEACHER`, `STUDENT`, `PARENT` | Scoped via `requireStudentAccess` |
| `GET /uploads/**` & `/api/uploads/**` | Static File Serving (Any auth user) | **Protected Controller with Object-Level Auth** | Static handler removed. Handled by `FileDownloadController` |
| `POST / PUT / DELETE /uploads/**` | Unrestricted HTTP methods | **`denyAll()`** | Only GET allowed through download controller; deletes require `DELETE /api/upload/{fileName}` (Admin) |
| `POST / PUT / DELETE /api/fee-structure/**` | `ADMIN` (Filter only) | `ADMIN` (Filter + Controller) | `requireAdmin` added to `create`, `update`, `delete` |
| `POST /api/fee-transactions` | `ADMIN` (Filter only) | `ADMIN` (Filter + Controller) | `requireAdmin` added to `recordPayment` |
| `DELETE /api/upload/{fileName}` | `ADMIN` (Filter only) | `ADMIN` (Filter + Controller) | `requireAdmin` added to `FileUploadController.delete` |

---

## 3. Upload & Private Download Authorization Design

### Elimination of Static File Serving
1. **Removed `addResourceHandlers` in `WebConfig.java`**: Spring MVC no longer statically binds the filesystem path `/uploads/**` to direct HTTP streaming.
2. **`FileDownloadController.java` (`GET /uploads/{fileName:.+}` and `GET /api/uploads/{fileName:.+}`)**:
   - Delegates access checks directly to `AcademicAccessService.requireFileAccess(authentication, fileName)`.
   - Streams the file via `FileStorageService.loadAsResource(fileName)`.
   - Sets safe security headers:
     - `Content-Type`: resolved via verified extension MIME mapping.
     - `Content-Disposition: attachment; filename="..."`: prevents browser auto-execution of untrusted scripts/HTML.
     - `Cache-Control: no-store, no-cache, must-revalidate`: prevents sensitive academic records and submissions from lingering in proxy/browser caches.
     - `X-Content-Type-Options: nosniff`: prevents MIME-sniffing attacks.
3. **HTTP Filter Restrictions (`SecurityConfig.java`)**:
   - `GET /uploads/**`, `/api/uploads/**`: `.authenticated()`
   - All other methods on `/uploads/**`, `/api/uploads/**`: `.denyAll()`

### Record-Level Ownership & Reference Verification (`requireFileAccess`)
When a user requests a file `fileName`:
1. **Authentication Check:** Must be authenticated (unauthenticated -> 401).
2. **Path Traversal / Filename Validation:** Filename must strictly conform to UUID + allowed extension regex (`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.(?i:pdf|png|jpg|jpeg|doc|docx|txt)$`). Traversal sequences (e.g. `../`) trigger immediate 400 Bad Request.
3. **Role Checks:**
   - **`ADMIN`:** Allowed access to all files for administrative oversight and audit.
   - **Student Submissions (`AssignmentSubmission`):**
     - Submitting student is allowed access (`studentId == currentStudent.id`).
     - Parent of the submitting student is allowed access (`studentId in currentParentChildren`).
     - Assigned teacher teaching that submission's assignment `classId` AND `subject` is allowed access.
     - All other users receive 403 Forbidden.
   - **Assignment Attachments (`Assignment`):**
     - Assigned teacher teaching that assignment `classId` AND `subject` is allowed access.
     - Students enrolled in that assignment's `classId` are allowed access.
     - Parents with a child enrolled in that assignment's `classId` are allowed access.
     - All other users receive 403 Forbidden.
   - **Announcements (`Announcement`):**
     - If `visibleTo` is specified, caller's role must match one of the allowed roles.
     - If `visibleTo` is empty/null, all authenticated users are permitted.
   - **Unreferenced / Orphaned Files:**
     - Files not referenced by any academic submission, assignment, or announcement are rejected with 403 Forbidden for non-admins. They are never made public.

---

## 4. Frontend Compatibility & Migration

- Frontend already utilizes `downloadProtectedFile` in `frontend/app/services/downloadService.ts`, which issues authenticated requests with the session Bearer token via `apiClient.get<Blob>(...)`.
- Because `FileDownloadController` maps both `/uploads/{fileName}` and `/api/uploads/{fileName}`, existing frontend links remain functional without breaking student or teacher workflows.
- Old stored files follow the standard UUID naming scheme and are indexed by URL/filename across submissions, assignments, and announcements.

---

## 5. Verification & Quality Gates

| Suite | Command | Result | Details |
|---|---|:---:|---|
| **Backend Unit & Integration** | `./mvnw.cmd test` | **PASS** | 101 tests passed (0 failures, 0 errors, 0 skipped) |
| **Backend Package** | `./mvnw.cmd -DskipTests clean package` | **PASS** | `backend-0.0.1-SNAPSHOT.jar` built cleanly |
| **Frontend Unit Tests** | `npm test` | **PASS** | 11 vitest tests passed |
| **Frontend Lint** | `npm run lint` | **PASS** | 0 warnings, 0 errors (`--max-warnings=0`) |
| **Frontend Typecheck** | `npm run typecheck` | **PASS** | 0 TypeScript errors |
| **Frontend Production Build** | `npm run build` | **PASS** | 46 static pages generated successfully |
| **ML Service Tests** | `python -m pytest` | **PASS** | 11 pytest tests passed in 0.49s |
| **Docker Compose Config** | `docker compose --env-file .env.example config --quiet` | **PASS** | Clean configuration syntax |

---

## 6. Remaining Risks & Next Steps

1. **HttpOnly Cookie Sessions (Task 01.3):**
   - JWT tokens remain stored in browser `localStorage`. Migration to HttpOnly, SameSite cookies with CSRF defense is scheduled for Task 01.3 (`feature/01-3-secure-sessions`).
2. **CI Hardening & Dependency Scanning (Task 01.4):**
   - Automated dependency audit and static security analysis in CI will be finalized in Task 01.4 (`feature/01-4-security-ci`).
