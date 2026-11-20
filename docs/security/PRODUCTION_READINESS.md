# Production Readiness & Security Baseline Assessment

**Document Version:** 1.0.0  
**Assessment Date:** November 2026  
**Lead DevSecOps / Security Engineer:** Sathu  
**Repository:** [EduSmart-AI (CampusCore)](https://github.com/Sathurjanv23/EduSmart-AI)  
**Feature:** 01.4 — Security CI and Production Readiness  
**Task:** 01.4.3 — Production Readiness & Operations  
**Branch:** `feature/01-4-3-production-readiness`  

---

## 1. Executive Summary & Assessment Criteria

This document establishes the verified production-readiness baseline for **CampusCore (EduSmart-AI)**. Every operational domain, security gate, and infrastructure interface has been audited against enterprise security standards.

To provide honest, accountable readiness reporting without premature certification, every check is tagged with one of five standardized statuses:

* **`VERIFIED PASS`**: The control has been implemented, validated through automated unit/integration/CI tests, and verified in codebase configuration.
* **`FAILED`**: The control was evaluated and failed to meet security or architectural requirements.
* **`NOT TESTED`**: The control or procedure is designed and documented, but has not yet been executed in a live production environment (e.g. disaster recovery drills on live Atlas clusters).
* **`BLOCKED`**: The control cannot proceed due to external environment blockers (e.g. missing paid infrastructure or organization permissions).
* **`NOT APPLICABLE`**: The control does not apply to the current architecture or threat model.

---

## 2. Production Readiness Assessment Matrix

| Domain | Control ID | Control Description | Status | Verification Evidence / Architecture Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | SEC-AUTH-01 | HttpOnly, Secure, SameSite session cookies | `VERIFIED PASS` | Cookie attributes harmonized in `CookieService.java` and `SecurityConfig.java`. Validated by MockMvc characterization tests. |
| **Authentication** | SEC-AUTH-02 | Double-Submit CSRF protection | `VERIFIED PASS` | `CookieCsrfTokenRepository` with `X-XSRF-TOKEN` header and `CsrfCookieFilter`. Safe state-changing request validation. |
| **Authentication** | SEC-AUTH-03 | Login, OTP, and Password Reset rate limiting | `VERIFIED PASS` | `RateLimitService.java` enforces in-memory bucket limits per IP/username across auth endpoints. |
| **Authentication** | SEC-AUTH-04 | Single-instance revocation / Multi-instance limit | `VERIFIED PASS` | In-memory token revocation cache protects single instance; multi-instance topology documented with Redis migration path in `SESSION_DEPLOYMENT.md`. |
| **Authorization** | SEC-AC-01 | Scoped student self-records and parent link access | `VERIFIED PASS` | Scoped `/api/students/me`, `/api/students/parent`, and `AcademicAccessService.java` verify relational linkage. |
| **Authorization** | SEC-AC-02 | Teacher scoped class roster access | `VERIFIED PASS` | `/api/students/class/{grade}/{section}` enforces teacher assigned-class restriction; global `/api/students` restricted to `ADMIN`. |
| **Transport** | SEC-NET-01 | HTTPS termination & Secure flag enforcement | `VERIFIED PASS` | `application-prod.properties` enforces `security.cookie.secure=true`; `ProductionEnvironmentValidator` throws if false in `prod` profile. |
| **Transport** | SEC-NET-02 | Explicit CORS origin restriction (no wildcards) | `VERIFIED PASS` | `CorsConfig.java` strictly rejects `*` and parses explicit allowed origins. Validated by startup checks. |
| **Infrastructure**| SEC-INF-01 | Least-privilege container runtime | `VERIFIED PASS` | `docker-compose.yml` configures `read_only: true`, `security_opt: [no-new-privileges:true]`, and explicit `tmpfs` mounts. |
| **Infrastructure**| SEC-INF-02 | Private ML service isolation | `VERIFIED PASS` | ML service runs on isolated `internal` Docker network without host port publishing. Accessible solely by Backend service. |
| **Storage** | SEC-DAT-01 | Non-public upload directory & path sanitization | `VERIFIED PASS` | Uploads served via authenticated endpoints; `FileStorageService.java` validates extensions, MIME types, and path traversal (`..`). |
| **Storage** | SEC-DAT-02 | MongoDB Atlas continuous backup & PITR | `NOT TESTED` | Architecture, retention schedules, and restore playbooks documented in `BACKUP_RESTORE.md`. Physical restore drill pending staging cluster provisioning. |
| **Observability** | SEC-OBS-01 | Correlation IDs across requests & logs | `VERIFIED PASS` | `CorrelationIdFilter.java` assigns `X-Correlation-ID` into SLF4J MDC and response headers. |
| **Observability** | SEC-OBS-02 | Actuator liveness & readiness health probes | `VERIFIED PASS` | Probes enabled in `application-prod.properties`; `/actuator/health/**` permitted without authentication in `SecurityConfig.java`. |
| **Observability** | SEC-OBS-03 | Sanitized error responses (zero stack trace leaks) | `VERIFIED PASS` | `server.error.include-stacktrace=never`, `include-message=never`, `include-binding-errors=never` configured. |
| **Supply Chain** | SEC-CI-01 | Automated PR secret scanning | `VERIFIED PASS` | Gitleaks scan blocks unredacted credentials in PR diffs and commit history. |
| **Supply Chain** | SEC-CI-02 | Blocking dependency vulnerability gates | `VERIFIED PASS` | `npm audit --omit=dev --audit-level=critical`, `pip-audit`, and Trivy (`severity: CRITICAL`, `exit-code: 1`) act as blocking CI gates. |
| **Machine Learning**| SEC-ML-01 | Synthetic training data disclaimer & guardrails | `VERIFIED PASS` | Prominent disclaimers preserved in UI and documentation; ML risk output is strictly advisory and cannot automate adverse decisions. |
| **Privacy / PDPA**| SEC-PRV-01 | School record privacy & statutory compliance | `NOT TESTED` | Technical controls implemented; formal legal compliance review under Sri Lanka Personal Data Protection Act No. 9 of 2022 marked for qualified legal counsel. |

---

## 3. Environment Hardening & Startup Validation

### 3.1 Production Environment Validator
The `ProductionEnvironmentValidator` bean executes at startup when the `prod` profile is active (`SPRING_PROFILES_ACTIVE=prod`). It terminates startup with `IllegalStateException` if any of the following insecure configurations are detected:
1. `JWT_SECRET` has fewer than 32 characters or matches known sample/insecure placeholders.
2. `COOKIE_SECURE` is set to `false`.
3. `APP_SEED_DEMO_DATA` is enabled (`true`).
4. `CORS_ALLOWED_ORIGINS` contains `localhost` or `127.0.0.1`.

### 3.2 Secure Mail & Session Architecture
* **SMTP Delivery**: In production, MailHog is disabled. Outbound notifications use external SMTP relays (e.g. SendGrid, Amazon SES, or institutional relays) with mandatory STARTTLS (`spring.mail.properties.mail.smtp.starttls.required=true`).
* **Session Cookies**: Cookies are emitted with `HttpOnly`, `SameSite=Lax` (or `Strict`), and `Secure=true`. Cross-site requests require valid `X-XSRF-TOKEN` headers derived from the double-submit cookie.

---

## 4. Student & Parent Privacy (Data Protection Baseline)

### 4.1 Legal Review Notice: Sri Lanka Personal Data Protection Act (PDPA) No. 9 of 2022
CampusCore processes personal data of minors (students) and their legal guardians (parents/teachers). While technical controls have been engineered to support privacy-by-design, **no software tool or automated checklist can certify legal compliance**.

> [!IMPORTANT]
> Formal compliance with the Sri Lanka Personal Data Protection Act (PDPA) No. 9 of 2022 and Ministry of Education directives requires qualified institutional legal review. The software provides the necessary technical primitives (access scoping, encryption, audit trails) but operational policies must be legally verified.

### 4.2 Data Processing Primitives
* **Access Control**: Administrative student listings are restricted to `ADMIN`. Teachers can only view students enrolled in their assigned classes. Parents can only access records of their verified linked children.
* **Data Retention & Deletion**: Student academic records are retained during active enrollment. Administrative soft-deletion and hard-deletion workflows require explicit administrative confirmation.
* **Audit Trails**: Security events (login attempts, password resets, role modifications, grade submissions) are recorded in application logs with structured correlation IDs.

---

## 5. Machine Learning Governance & Ethical Boundaries

### 5.1 Synthetic Training Data Reality
The ML risk prediction model (`ml-service/artifacts/student_risk_pipeline.joblib`) was trained on **synthetically generated academic feature distributions** (attendance percentage, assignment submission timeliness, previous exam marks).

> [!WARNING]
> **Advisory-Only Model**: The ML student risk pipeline has NOT been validated on real-world longitudinal student populations. Its outputs are speculative and intended solely for early-warning teacher advisories.

### 5.2 Prohibition of Automated Adverse Student Decisions
1. **Human-in-the-Loop Mandatory**: Predictive risk scores may never be used to automatically withhold grades, deny exam eligibility, suspend students, or trigger disciplinary actions.
2. **Teacher Review Required**: Teachers and counselors must independently assess student circumstances before initiating academic interventions.
3. **Data Protection Safeguard**: Student prediction endpoints (`/api/ml/**`) require authenticated `ADMIN` or `TEACHER` credentials and are strictly forbidden from public indexing.
