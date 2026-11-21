package com.sms.backend.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Persisted marks record for a student in an academic subject and assessment context.
 *
 * <p>Publication lifecycle (Task 02.1 foundation, Task 02.3 enforcement):
 * <ul>
 *   <li>{@code status="DRAFT"}: Editable by authorized teacher/admin. Excluded from student/parent portal endpoints.</li>
 *   <li>{@code status="PUBLISHED"}: Visible to student and linked parents. Immutable unless unpublished.</li>
 * </ul>
 *
 * <p>Compound Indexes:
 * <ul>
 *   <li>Class + Subject lookup for teacher roster queries.</li>
 *   <li>Unique (studentId, subject, examId) for exam-linked entries to prevent duplicate writes.</li>
 * </ul>
 */
@Document(collection = "marks")
@CompoundIndexes({
    @CompoundIndex(name = "idx_marks_class_subject", def = "{'classId': 1, 'subject': 1}"),
    @CompoundIndex(name = "idx_marks_student_subject_exam", def = "{'studentId': 1, 'subject': 1, 'examId': 1}", unique = true, sparse = true),
    @CompoundIndex(name = "idx_marks_student_subject_assessment", def = "{'studentId': 1, 'subject': 1, 'assessmentId': 1}", unique = true, sparse = true)
})
public class Marks {
    @Id
    private String id;

    @Indexed
    private String studentId;
    private String studentName;

    @Indexed
    private String parentEmail;

    @Indexed
    private String classId;

    @Indexed
    private String examId;

    /**
     * Unique identifier for the assessment event within a subject/class.
     * For exams, equals examId. For non-exam assessments, formatted as "{assessmentType}#{term}" or custom ID.
     */
    @Indexed
    private String assessmentId;

    @Indexed
    private String subject;

    /** Type of assessment: TERM_TEST, MID_TERM, FINAL, CLASS_TEST, ASSIGNMENT, OTHER */
    private String assessmentType;

    /** Academic term or year (e.g., "Term 1", "2026-T1") */
    private String term;

    /** Marks obtained by student. Integer representation avoids floating point precision issues. */
    private int marks;

    /** Total possible marks for the assessment. Must be > 0. */
    private int totalMarks;

    /** Optional feedback or remarks from the evaluating teacher. */
    private String comments;

    /** Publication state: DRAFT or PUBLISHED. Default is DRAFT. */
    @Indexed
    private String status = "DRAFT";

    /** Timestamp when marks were published. Null while in DRAFT. */
    private Instant publishedAt;

    /** Principal who published the marks record. */
    private String publishedBy;

    private Instant recordedAt;

    /** Email of the teacher/admin who created this record. */
    private String recordedBy;

    private Instant updatedAt;

    public Marks() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }

    public String getClassId() { return classId; }
    public void setClassId(String classId) { this.classId = classId; }

    public String getExamId() { return examId; }
    public void setExamId(String examId) { this.examId = examId; }

    public String getAssessmentId() { return assessmentId; }
    public void setAssessmentId(String assessmentId) { this.assessmentId = assessmentId; }

    /**
     * Resolves the effective assessment identifier for duplicate detection and grouping.
     * Guaranteed non-null and backward-compatible with legacy records.
     */
    public String getEffectiveAssessmentId() {
        if (assessmentId != null && !assessmentId.isBlank()) {
            return assessmentId;
        }
        if (examId != null && !examId.isBlank()) {
            return examId;
        }
        String typePart = (assessmentType != null && !assessmentType.isBlank()) ? assessmentType : "GENERAL";
        String termPart = (term != null && !term.isBlank()) ? term : "T1";
        return typePart + "#" + termPart;
    }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }

    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }

    public int getMarks() { return marks; }
    public void setMarks(int marks) { this.marks = marks; }

    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public String getPublishedBy() { return publishedBy; }
    public void setPublishedBy(String publishedBy) { this.publishedBy = publishedBy; }

    public Instant getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }

    public String getRecordedBy() { return recordedBy; }
    public void setRecordedBy(String recordedBy) { this.recordedBy = recordedBy; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
