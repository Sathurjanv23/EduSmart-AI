# CampusCore Database Backup & Disaster Recovery Runbook

**Document Version:** 1.0.0  
**Storage Tier:** MongoDB Atlas Dedicated / Shared Clusters  
**Lead DevSecOps Engineer:** Sathu  
**Repository:** [EduSmart-AI](https://github.com/Sathurjanv23/EduSmart-AI)  

---

## 1. Backup Architecture & Recovery Objectives

CampusCore stores school management records, attendance history, academic marks, and student identity metadata in MongoDB. To ensure continuous availability and data integrity against accidental deletion, hardware failure, or ransomware, a multi-tier backup strategy is established.

### Recovery Objectives
* **Recovery Point Objective (RPO):** $\le$ **1 Hour**. In the event of catastrophic data loss, no more than one hour of academic submissions or marks data may be lost.
* **Recovery Time Objective (RTO):** $\le$ **2 Hours**. The system must be fully restored and operational on production or disaster-recovery infrastructure within 2 hours.

---

## 2. Backup Strategy & Schedules

### 2.1 Continuous Cloud Backups (MongoDB Atlas)
* **Point-in-Time Restore (PITR):** Continuous oplog tracking enabled on Atlas, allowing restoration to any second within the past 7 days.
* **Automated Daily Snapshots:** Captured at 02:00 UTC (07:30 IST) daily.
* **Retention Schedule:**
  - Daily Snapshots: Retained for 14 days.
  - Weekly Snapshots: Retained for 60 days.
  - Monthly Snapshots: Retained for 365 days (meeting school academic year record audit requirements).

### 2.2 Off-Site Encrypted Archive (Cold Storage)
* Monthly mongodump archives compressed, encrypted using AES-256 (`gpg --symmetric`), and stored in an isolated, immutable object storage bucket (AWS S3 Glacier or equivalent).

---

## 3. Test-Restore Procedure (Disaster Recovery Drill)

> [!CAUTION]
> **Status: NOT TESTED on Live Production Cluster**  
> This restore procedure is documented and validated against containerized local MongoDB dumps. Live disaster recovery drill on an isolated Atlas staging cluster is scheduled for pre-launch staging verification.

### Step-by-Step Staging Restore Drill:
1. **Never Restore Over Live Production Data**:
   - Always restore to a temporary, isolated target cluster (`smsdb_dr_test`).
2. **Initiate Atlas Point-in-Time Restore**:
   - Navigate to **MongoDB Atlas Console $\rightarrow$ Database Deployments $\rightarrow$ Backup**.
   - Select the target snapshot or point-in-time timestamp.
   - Choose **Restore to another cluster** $\rightarrow$ select `smsdb_dr_test`.
3. **Verify Data Integrity Post-Restore**:
   ```javascript
   // Run verification script via mongosh on restored test database:
   use smsdb_dr_test;
   
   // 1. Verify student document counts
   const studentCount = db.students.countDocuments();
   print("Students Count: " + studentCount);
   
   // 2. Verify attendance records integrity
   const attendanceCount = db.attendances.countDocuments();
   print("Attendance Records: " + attendanceCount);
   
   // 3. Verify user authentication records
   const usersCount = db.users.countDocuments();
   print("Users Count: " + usersCount);
   ```
4. **Application Sanity Verification**:
   - Connect a staging backend container to `smsdb_dr_test`.
   - Execute read-only smoke tests (view student profile, list class marks).
5. **Teardown**:
   - Delete temporary restore cluster once validation is complete.

---

## 4. Failure Recovery Runbook (Production Disaster Recovery)

### Scenario A: Accidental Collection or Document Deletion
1. Identify the exact UTC timestamp immediately prior to the destructive event.
2. In MongoDB Atlas, select **Point-in-Time Restore**.
3. Restore the database to a secondary cluster at `T - 2 minutes`.
4. Export only the affected collection using `mongodump`:
   ```bash
   mongodump --uri="$DR_CLUSTER_URI" --collection=students --out=/tmp/recovery/
   ```
5. Import the recovered collection back into production using `mongorestore` with `--drop=false`:
   ```bash
   mongorestore --uri="$PROD_CLUSTER_URI" --collection=students /tmp/recovery/smsdb/students.bson
   ```

### Scenario B: Complete Cluster Corruption or Ransomware
1. Terminate all backend application containers immediately to prevent write skew:
   ```bash
   docker compose down backend
   ```
2. In MongoDB Atlas, initiate PITR restore to a freshly provisioned cluster.
3. Update `MONGODB_URI` in `.env.production` to point to the newly restored cluster connection string.
4. Start backend containers and execute post-deployment verification smoke tests:
   ```bash
   docker compose up -d backend
   curl -I http://127.0.0.1:8080/actuator/health/readiness
   ```
5. Resume edge traffic routing once readiness check reports `UP`.
