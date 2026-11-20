# Feature 01.3 Secure Authentication Sessions & CSRF Architecture

**Audit & Implementation Date:** November 2026  
**Lead Engineer / Contributor:** Sathu  
**Repository:** [EduSmart-AI](https://github.com/Sathurjanv23/EduSmart-AI)  
**Feature Branch:** `feature/01-3-secure-sessions`  
**Base Branch:** `main`

---

## 1. Executive Summary

In Feature 01.1 and 01.2, CampusCore identified and hardened academic record-level access control, role boundaries, and private file downloads. However, authenticated sessions still relied on browser `localStorage` storing JWT bearer tokens, making them vulnerable to cross-site scripting (XSS) exfiltration.

In Task 01.3, CampusCore has completed a full migration from client-side `localStorage` token storage to **secure, server-managed `HttpOnly` cookie-based sessions** coupled with **comprehensive CSRF defense** and **zero-database-write-on-read session revocation**.

---

## 2. Threat Model & Key Attack Vectors Mitigated

| Threat / Vulnerability | Previous Architecture (`localStorage`) | Hardened Architecture (`HttpOnly` Cookie Sessions) |
|---|---|---|
| **XSS Token Theft** | Any XSS or untrusted script can execute `localStorage.getItem("sms.auth.token")` and exfiltrate active user tokens. | Session cookie is marked `HttpOnly`; JavaScript execution context cannot read or access the token bytes. |
| **Cross-Site Request Forgery (CSRF)** | N/A (Authorization header is not automatically sent cross-origin). | Double Submit Cookie pattern (`CookieCsrfTokenRepository` + `XSRF-TOKEN` cookie / `X-CSRF-TOKEN` header) + `RequestOriginValidationFilter` (`Sec-Fetch-Site` & `Origin` verification). |
| **Session Invalidation on Logout** | Client merely removed the token from `localStorage`; the signature remained valid on the backend until expiry. | Explicit `POST /api/auth/logout` records the token's `jti` in `RevokedTokenService`. Reusing a logged-out token/cookie returns `401 Unauthorized`. |
| **High Read Database Overhead** | Stateless JWT read overhead was zero, but naive revocation tables require database reads on every single HTTP request. | Hybrid revocation: in-memory `ConcurrentHashMap` cache backed by a MongoDB collection with a native TTL index on `expiresAt` (`expireAfter = "0s"`). Normal requests execute with zero database writes. |
| **Premature Session Issuance** | Tokens could potentially be generated prior to 2FA completion. | Authenticated session cookie is issued **strictly and exclusively upon successful 2FA OTP verification** (`/api/auth/verify-otp`). Token is omitted from JSON responses. |

---

## 3. Architecture & Implementation Details

### 3.1 Backend Session Cookie (`CookieService.java`)
- **Cookie Name:** `sms_session` (configurable via `security.cookie.name`).
- **Attributes:**
  - `HttpOnly`: Enforced on all session cookies to prevent JavaScript access.
  - `SameSite`: Default `Lax` (configurable via `security.cookie.same-site`), providing cross-site browsing protection while supporting top-level navigations.
  - `Secure`: Configurable via `security.cookie.secure` (`false` in local HTTP development; `true` in production HTTPS).
  - `Path`: `/` ensuring seamless availability across all API endpoints and downloads.
  - `Max-Age`: Tied directly to the token expiration window (e.g., 24 hours).
- **Clearing Cookies:** `clearSessionCookie()` issues `Set-Cookie: sms_session=; Path=/; Max-Age=0; HttpOnly`.

### 3.2 Dual Token Resolution & Token Revocation (`JwtFilter.java` & `RevokedTokenService.java`)
- `JwtFilter` extracts tokens from:
  1. `sms_session` cookie (primary, browser clients).
  2. `Authorization: Bearer <token>` (retained for programmatic/CLI integrations).
- Each token includes a unique `jti` claim (UUID) generated at OTP verification.
- `RevokedTokenService` maintains:
  - An in-memory concurrent map for $O(1)$ fast lookups without database latency.
  - MongoDB `revoked_tokens` collection with `expireAfter = "0s"` for automated TTL cleanup when token validity expires.
- If a revoked token is presented, `JwtFilter` aborts processing and Spring Security yields `401 Unauthorized`.

### 3.3 CSRF Protection Architecture (`SecurityConfig.java`, `CsrfCookieFilter.java`, `RequestOriginValidationFilter.java`)
- **Double Submit Cookie Repository:**
  - `CookieCsrfTokenRepository.withHttpOnlyFalse()` issues `XSRF-TOKEN` cookie accessible by client-side script for header submission.
  - `CsrfTokenRequestAttributeHandler` handles deferred token generation.
  - `CsrfCookieFilter` forces resolution of deferred tokens so the `XSRF-TOKEN` cookie is automatically set in HTTP responses.
- **Dedicated Bootstrap Endpoint:**
  - `GET /api/auth/csrf` provides `{ "token": "...", "headerName": "X-CSRF-TOKEN", "parameterName": "_csrf" }` and sets the `XSRF-TOKEN` cookie for cross-origin or SPA initial load.
- **Origin Validation Defense-in-Depth:**
  - `RequestOriginValidationFilter` intercepts state-changing methods (`POST`, `PUT`, `PATCH`, `DELETE`).
  - Checks Fetch Metadata: `Sec-Fetch-Site: cross-site` is rejected with `403 Forbidden`.
  - Checks `Origin` and `Referer` headers against configured `app.cors.allowed-origins`.
- **Pre-Login Exemption:**
  - Public registration, login, and password reset endpoints (`/login`, `/signup`, `/verify-otp`, `/resend-otp`, `/forgot-password`, `/reset-password`) are ignored by CSRF token checks to prevent chicken-and-egg bootstrap failures, but remain guarded by origin validation and rate limiting.

### 3.4 Frontend Migration (`apiService.ts`, `tokenStorage.ts`, `AuthProvider.tsx`)
- **`withCredentials: true`:** Central Axios client (`apiClient`) enables credentials on all requests, automatically sending `sms_session` and `XSRF-TOKEN` cookies.
- **Automatic CSRF Attachment:**
  - Request interceptor inspects state-changing methods (`POST`, `PUT`, `PATCH`, `DELETE`).
  - Reads `XSRF-TOKEN` cookie or calls `/api/auth/csrf`.
  - Sets `X-XSRF-TOKEN` and `X-CSRF-TOKEN` headers.
- **Removal of `localStorage` Persistence:**
  - `tokenStorage.ts`: `readAuthToken()` returns `null`; `writeAuthToken()` is a no-op; `clearAuthToken()` purges legacy `sms.auth.token` keys from `localStorage`.
- **Session Lifecycle in `AuthProvider.tsx`:**
  - On mount, `refreshSession()` queries `GET /api/auth/me`. If the cookie is present and valid, session initializes directly.
  - `establishSession()` handles successful OTP verification without expecting tokens in the JSON response body.
  - `signOut()` triggers `POST /api/auth/logout` to revoke the session on the backend before redirecting to `/login`.

---

## 4. Test Verification & Characterization Coverage

### 4.1 Backend Test Coverage (120 Tests)
- `CookieServiceTest` (4 unit tests):
  - `createsHttpOnlySessionCookieWithConfiguredAttributes`
  - `clearsSessionCookieWithMaxAgeZero`
  - `extractsTokenFromSessionCookie`
  - `returnsNullWhenCookieMissing`
- `RevokedTokenServiceTest` (3 unit tests):
  - `revokesTokenAndRejectsSubsequentChecks`
  - `removesExpiredRevocations`
  - `handlesNullOrBlankInputsSafely`
- `AuthServiceImplTest` (4 unit tests):
  - `verifyOtpAttachesCookieAndOmitsTokenFromResponseBody`
  - `logoutRevokesTokenAndClearsCookie`
  - `loginRateLimit` & `signupPrivilegeVerification`
- `SecurityAuthorizationCharacterizationTest` (Integration test suite):
  - `SessionCookieScope`: Valid cookie allows access; tampered cookie returns 401; logout revokes session and subsequent use returns 401.
  - `CsrfScope`: CSRF endpoint returns token and cookie; state-changing requests without CSRF are rejected with 403; requests with valid CSRF proceed.
  - `OriginScope`: Cross-site fetch metadata is rejected; untrusted origins are rejected; authorized origins are accepted.
  - Full regression baseline across 120 automated tests: **120 passed, 0 failures, 0 skipped**.

### 4.2 Frontend Quality Gates
- **Unit Tests:** `npm test` — 12 tests passed across 5 test suites.
- **Type Checking:** `npm run typecheck` — 0 TypeScript errors.
- **Linting:** `npm run lint` — 0 warnings, 0 errors (`--max-warnings=0`).
- **Production Build:** `npm run build` — Optimized Next.js build succeeded with 46 prerendered static routes.

### 4.3 ML Service Quality Gate
- **Test Suite:** `python -m pytest` — 11 passed in 0.37s.

### 4.4 Infrastructure Gate
- **Docker Compose:** `docker compose --env-file .env.example config` — Schema and environment mapping validated.
