# CampusCore Production Deployment Runbook

**Document Version:** 1.0.0  
**Target Architecture:** Docker Compose / Reverse Proxy / Kubernetes  
**Lead DevSecOps Engineer:** Sathu  
**Repository:** [EduSmart-AI](https://github.com/Sathurjanv23/EduSmart-AI)  

---

## 1. Overview & Operational Principles

This runbook outlines the standard operating procedure for deploying, verifying, and rolling back CampusCore (EduSmart-AI) in production environments.

### Core Principles
1. **Never Deploy with Default Secrets**: The production profile refuses startup if sample credentials or weak secrets are detected.
2. **Zero In-Flight Data Loss**: Database migrations and index creation are validated before cutting traffic over.
3. **Continuous Health Verification**: Automated container healthchecks and Actuator liveness/readiness probes verify service health before edge proxy routing.
4. **Instant Rollback Capability**: Images and configurations are version-tagged to permit immediate rollback to the previous known-good deployment.

---

## 2. Pre-Deployment Checklist

Complete every check prior to executing a production deployment:

- [ ] **Release Tag**: Verified release commit on `main` has passed all GitHub Actions CI gates (Green check).
- [ ] **Environment Configuration**: Staged `.env.production` contains cryptographically strong secrets (`JWT_SECRET` generated via `openssl rand -hex 32`).
- [ ] **HTTPS Certificate**: Valid TLS certificate installed on ingress/reverse proxy (Let's Encrypt or institutional CA).
- [ ] **Database Connection**: MongoDB Atlas connection verified with TLS enabled and least-privilege application user credentials.
- [ ] **SMTP Credentials**: External SMTP provider (SendGrid, SES, institutional relay) credentials verified with STARTTLS.
- [ ] **Backup Snapshot**: Triggered on-demand MongoDB Atlas snapshot immediately prior to deployment (see [BACKUP_RESTORE.md](./BACKUP_RESTORE.md)).
- [ ] **Change Notification**: Academic staff and administrators notified of scheduled maintenance or deployment window.

---

## 3. Step-by-Step Deployment Procedure

### Step 3.1: Environment Variable Provisioning
Ensure `.env.production` exists on the target host with restricted file permissions (`chmod 600 .env.production`):

```bash
# Verify file permissions
ls -l .env.production
# -rw------- 1 root root ... .env.production
```

### Step 3.2: Pull or Build Production Container Images
Pull pre-built versioned images from the container registry or build directly:

```bash
docker compose --file docker-compose.prod.yml --env-file .env.production build --pull
```

### Step 3.3: Database Schema & Index Verification
Before bringing up new application containers, verify that database indexes are synchronized:

```bash
# Spring Boot automatically executes index creation if spring.data.mongodb.auto-index-creation=true
# Verify MongoDB connectivity:
mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"
```

### Step 3.4: Staged Container Startup
Start supporting infrastructure services first, followed by internal services, then edge-facing containers:

```bash
# 1. Start Internal ML Service
docker compose --file docker-compose.prod.yml --env-file .env.production up -d ml-service

# 2. Verify ML Service Healthcheck
docker compose --file docker-compose.prod.yml ps ml-service
# Wait for status: healthy

# 3. Start Backend Application
docker compose --file docker-compose.prod.yml --env-file .env.production up -d backend

# 4. Verify Backend Health and Readiness
curl --silent --fail http://127.0.0.1:8080/actuator/health/readiness | jq .
# Expected output: {"status":"UP"}

# 5. Start Frontend Container
docker compose --file docker-compose.prod.yml --env-file .env.production up -d frontend

# 6. Verify Complete Fleet Health
docker compose --file docker-compose.prod.yml ps
```

---

## 4. Post-Deployment Verification (Smoke Tests)

Execute the following smoke tests immediately following container startup:

1. **Actuator Health Probe**:
   ```bash
   curl -I https://sms.school.edu.lk/actuator/health
   # HTTP/2 200
   ```
2. **CSRF Bootstrap Token**:
   ```bash
   curl -i https://sms.school.edu.lk/api/auth/csrf
   # HTTP/2 200, Sets XSRF-TOKEN cookie
   ```
3. **Session Cookie Security Attributes**:
   - Verify that cookies returned by `/api/auth/login` have:
     - `HttpOnly; Secure; SameSite=Lax` (or `Strict`)
     - Path set to `/`
4. **Correlation ID Logging**:
   ```bash
   docker compose logs --tail=50 backend | grep -i "correlationId"
   # Verify log entries display: [correlationId: <uuid>]
   ```
5. **Authenticated Role Guard Test**:
   - Verify that student credentials cannot access `/api/admin/users`.
   - Verify that teacher credentials can access assigned class rosters.

---

## 5. Rollback Procedure

If severe regressions, database failures, or authentication blockers occur during post-deployment verification:

### Immediate Rollback Steps
1. **Revert Edge Routing to Previous Container Tag**:
   ```bash
   # Point docker-compose to previous release image tag
   export APP_VERSION=previous-known-good-tag
   docker compose --file docker-compose.prod.yml --env-file .env.production up -d --no-deps backend frontend
   ```
2. **Database Rollback (If Schema Modified)**:
   - If destructive schema changes occurred, initiate Point-in-Time Restore (PITR) via MongoDB Atlas to the pre-deployment snapshot time (see [BACKUP_RESTORE.md](./BACKUP_RESTORE.md)).
3. **Clear Session Invalidation Cache (If Required)**:
   - If session secret was altered, restart backend instances to ensure consistent session validation state.
4. **Post-Rollback Notification**:
   - Notify the engineering lead (Sathu) and log an incident ticket according to [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md).
