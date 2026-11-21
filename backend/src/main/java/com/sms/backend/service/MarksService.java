package com.sms.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.sms.backend.dto.MarksRequest;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Exam;
import com.sms.backend.model.Marks;
import com.sms.backend.model.Student;
import com.sms.backend.repository.ExamRepository;
import com.sms.backend.repository.MarksRepository;
import com.sms.backend.repository.StudentRepository;

@Service
public class MarksService {
    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_PUBLISHED = "PUBLISHED";

    private static final List<String> ALLOWED_ASSESSMENT_TYPES = List.of(
            "TERM_TEST", "MID_TERM", "FINAL", "CLASS_TEST", "ASSIGNMENT", "OTHER");

    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;

    public MarksService(
            MarksRepository marksRepository,
            StudentRepository studentRepository,
            ExamRepository examRepository) {
        this.marksRepository = marksRepository;
        this.studentRepository = studentRepository;
        this.examRepository = examRepository;
    }

    public Marks addMarks(MarksRequest request, String recordedBy) {
        validateRange(request.marks(), request.totalMarks());
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ApiException.notFound("Student"));

        String resolvedExamId = resolveExamId(request.examId());
        validateExamLink(request, student, resolvedExamId);
        checkDuplicateOnCreate(request.studentId(), request.subject(), resolvedExamId);

        Marks marks = new Marks();
        apply(marks, request, student, resolvedExamId, recordedBy);
        marks.setRecordedAt(Instant.now());
        marks.setStatus(STATUS_DRAFT);
        return marksRepository.save(marks);
    }

    public Marks updateMarks(String id, MarksRequest request, String recordedBy) {
        validateRange(request.marks(), request.totalMarks());
        Marks marks = requireById(id);

        if (STATUS_PUBLISHED.equals(marks.getStatus())) {
            throw ApiException.conflict("MARKS_ALREADY_PUBLISHED",
                    "Published marks cannot be modified directly. Unpublish first if revision is permitted.");
        }

        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ApiException.notFound("Student"));

        String resolvedExamId = resolveExamId(request.examId());
        validateExamLink(request, student, resolvedExamId);
        checkDuplicateOnUpdate(request.studentId(), request.subject(), resolvedExamId, id);

        apply(marks, request, student, resolvedExamId, recordedBy);
        return marksRepository.save(marks);
    }

    public List<Marks> getAllMarks() {
        return marksRepository.findAll();
    }

    /**
     * All marks for a student regardless of status (Used by Admin / authorized staff).
     */
    public List<Marks> getMarksByStudent(String studentId) {
        return marksRepository.findByStudentIdOrderByRecordedAtDesc(studentId);
    }

    /**
     * Privacy-safe student and parent view: returns only PUBLISHED marks.
     */
    public List<Marks> getPublishedMarksByStudent(String studentId) {
        return marksRepository.findByStudentIdAndStatusOrderByRecordedAtDesc(studentId, STATUS_PUBLISHED);
    }

    /**
     * Teacher marks roster view: retrieves marks for a class and subject.
     */
    public List<Marks> getMarksByClassAndSubject(String classId, String subject) {
        return marksRepository.findByClassIdAndSubjectIgnoreCaseOrderByStudentNameAsc(classId, subject);
    }

    /**
     * Teacher marks roster view: retrieves marks for a class, subject, and specific exam.
     */
    public List<Marks> getMarksByClassSubjectAndExam(String classId, String subject, String examId) {
        return marksRepository.findByClassIdAndSubjectIgnoreCaseAndExamIdOrderByStudentNameAsc(classId, subject, examId);
    }

    public Marks requireById(String id) {
        return marksRepository.findById(id).orElseThrow(() -> ApiException.notFound("Marks record"));
    }

    private void apply(Marks marks, MarksRequest request, Student student, String resolvedExamId, String recordedBy) {
        marks.setStudentId(student.getId());
        marks.setStudentName(student.getName());
        marks.setParentEmail(student.getParentEmail());
        marks.setClassId(student.getStudentClass());
        marks.setSubject(request.subject().trim());
        marks.setAssessmentType(normalizeAssessmentType(request.assessmentType()));
        marks.setTerm(request.term() == null || request.term().isBlank() ? null : request.term().trim());
        marks.setComments(request.comments() == null || request.comments().isBlank() ? null : request.comments().trim());
        marks.setMarks(request.marks());
        marks.setTotalMarks(request.totalMarks());
        marks.setExamId(resolvedExamId);
        marks.setRecordedBy(recordedBy);
        marks.setUpdatedAt(Instant.now());
    }

    private void validateRange(int marks, int totalMarks) {
        if (marks < 0 || totalMarks <= 0 || marks > totalMarks) {
            throw ApiException.badRequest("INVALID_MARKS", "Marks must be between zero and total marks");
        }
    }

    private String resolveExamId(String examId) {
        return (examId == null || examId.isBlank()) ? null : examId.trim();
    }

    private void validateExamLink(MarksRequest request, Student student, String resolvedExamId) {
        if (resolvedExamId == null) {
            return;
        }
        Exam exam = examRepository.findById(resolvedExamId)
                .orElseThrow(() -> ApiException.notFound("Exam"));
        if (!student.getStudentClass().equals(exam.getClassId())
                || !request.subject().equalsIgnoreCase(exam.getSubject())) {
            throw ApiException.badRequest(
                    "EXAM_OWNERSHIP_MISMATCH",
                    "Exam must belong to the selected student's class and subject");
        }
        if (exam.getTotalMarks() != null && request.totalMarks() > exam.getTotalMarks()) {
            throw ApiException.badRequest(
                    "TOTAL_MARKS_EXCEEDS_EXAM",
                    "Total marks (" + request.totalMarks() + ") cannot exceed the exam maximum (" + exam.getTotalMarks() + ")");
        }
    }

    private void checkDuplicateOnCreate(String studentId, String subject, String examId) {
        if (examId == null) {
            return; // Non-exam continuous assessments allow multiple entries or are updated via ID
        }
        marksRepository.findByStudentIdAndSubjectIgnoreCaseAndExamId(studentId, subject, examId)
                .ifPresent(existing -> {
                    throw ApiException.conflict("DUPLICATE_MARKS_RECORD",
                            "A marks record already exists for this student, subject, and exam. Use PUT /api/marks/"
                                    + existing.getId() + " to update.");
                });
    }

    private void checkDuplicateOnUpdate(String studentId, String subject, String examId, String currentId) {
        if (examId == null) {
            return;
        }
        marksRepository.findByStudentIdAndSubjectIgnoreCaseAndExamId(studentId, subject, examId)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(currentId)) {
                        throw ApiException.conflict("DUPLICATE_MARKS_RECORD",
                                "A marks record already exists for this student, subject, and exam.");
                    }
                });
    }

    private String normalizeAssessmentType(String assessmentType) {
        if (assessmentType == null || assessmentType.isBlank()) {
            return null;
        }
        String upper = assessmentType.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_ASSESSMENT_TYPES.contains(upper)) {
            throw ApiException.badRequest("INVALID_ASSESSMENT_TYPE",
                    "assessmentType must be one of: " + String.join(", ", ALLOWED_ASSESSMENT_TYPES));
        }
        return upper;
    }
}
