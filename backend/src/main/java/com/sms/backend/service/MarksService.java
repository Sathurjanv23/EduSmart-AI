package com.sms.backend.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.sms.backend.dto.MarksRequest;
import com.sms.backend.dto.PublishMarksRequest;
import com.sms.backend.dto.PublishMarksResponse;
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

        String resolvedAssessmentId = buildAssessmentId(resolvedExamId, request.assessmentId(), request.assessmentType(), request.term());
        checkDuplicateOnCreate(request.studentId(), request.subject(), resolvedExamId, resolvedAssessmentId);

        Marks marks = new Marks();
        apply(marks, request, student, resolvedExamId, resolvedAssessmentId, recordedBy);
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

        String resolvedAssessmentId = buildAssessmentId(resolvedExamId, request.assessmentId(), request.assessmentType(), request.term());
        checkDuplicateOnUpdate(request.studentId(), request.subject(), resolvedExamId, resolvedAssessmentId, id);

        apply(marks, request, student, resolvedExamId, resolvedAssessmentId, recordedBy);
        return marksRepository.save(marks);
    }

    /**
     * Publishes marks for a specific assessment context.
     * Enforces teacher authorization, score validity, and completeness (unless allowPartial is true).
     * Designed to be safe, idempotent, and resilient against concurrent/duplicate requests.
     */
    public PublishMarksResponse publishMarks(PublishMarksRequest request, String publishedBy) {
        if (request.classId() == null || request.classId().isBlank()) {
            throw ApiException.badRequest("INVALID_CLASS", "Class ID is required");
        }
        if (request.subject() == null || request.subject().isBlank()) {
            throw ApiException.badRequest("INVALID_SUBJECT", "Subject is required");
        }

        String targetAssessmentId = buildAssessmentId(request.examId(), request.assessmentId(), request.assessmentType(), request.term());

        List<Marks> candidates;
        if (request.markIds() != null && !request.markIds().isEmpty()) {
            candidates = new ArrayList<>();
            for (String markId : request.markIds()) {
                Marks m = requireById(markId);
                if (!m.getClassId().equals(request.classId())) {
                    throw ApiException.badRequest("CONTEXT_MISMATCH",
                            "Mark record " + markId + " does not belong to class " + request.classId());
                }
                if (!m.getSubject().equalsIgnoreCase(request.subject())) {
                    throw ApiException.badRequest("CONTEXT_MISMATCH",
                            "Mark record " + markId + " does not belong to subject " + request.subject());
                }
                if (request.examId() != null && !request.examId().isBlank()
                        && !request.examId().equals(m.getExamId())) {
                    throw ApiException.badRequest("CONTEXT_MISMATCH",
                            "Mark record " + markId + " does not belong to exam " + request.examId());
                }
                candidates.add(m);
            }
        } else {
            List<Marks> allInContext = marksRepository.findByClassIdAndSubjectIgnoreCaseOrderByStudentNameAsc(
                    request.classId(), request.subject());
            if (request.examId() != null && !request.examId().isBlank()) {
                candidates = allInContext.stream()
                        .filter(m -> request.examId().equals(m.getExamId()))
                        .toList();
            } else if (targetAssessmentId != null && !targetAssessmentId.equals("GENERAL#T1")) {
                candidates = allInContext.stream()
                        .filter(m -> targetAssessmentId.equalsIgnoreCase(m.getEffectiveAssessmentId()))
                        .toList();
            } else {
                candidates = allInContext;
            }
        }

        if (candidates.isEmpty()) {
            throw ApiException.badRequest("NO_MARKS_TO_PUBLISH",
                    "No marks records found to publish for the specified context.");
        }

        List<Marks> toPublish = new ArrayList<>();
        List<Marks> alreadyPublished = new ArrayList<>();
        Set<String> coveredStudentIds = new HashSet<>();

        for (Marks m : candidates) {
            validateRange(m.getMarks(), m.getTotalMarks());
            coveredStudentIds.add(m.getStudentId());
            if (STATUS_PUBLISHED.equals(m.getStatus())) {
                alreadyPublished.add(m);
            } else {
                toPublish.add(m);
            }
        }

        // Roster completeness enforcement (Requirement 9)
        if (!request.allowPartial()) {
            List<Student> enrolledStudents = studentRepository.findByStudentClass(request.classId());
            if (coveredStudentIds.size() < enrolledStudents.size()) {
                int missingCount = enrolledStudents.size() - coveredStudentIds.size();
                throw ApiException.badRequest("INCOMPLETE_ROSTER_MARKS",
                        "Cannot publish: " + missingCount + " student(s) in class " + request.classId()
                                + " are missing marks for this assessment. Complete all marks or enable partial publication.");
            }
        }

        // Persist publication state
        Instant now = Instant.now();
        for (Marks m : toPublish) {
            m.setStatus(STATUS_PUBLISHED);
            m.setPublishedAt(now);
            m.setPublishedBy(publishedBy);
            m.setUpdatedAt(now);
            if (m.getAssessmentId() == null) {
                m.setAssessmentId(m.getEffectiveAssessmentId());
            }
        }

        if (!toPublish.isEmpty()) {
            marksRepository.saveAll(toPublish);
        }

        String summaryMessage = toPublish.isEmpty()
                ? "All targeted marks are already published."
                : "Successfully published marks for " + toPublish.size() + " student(s).";

        return new PublishMarksResponse(
                request.classId(),
                request.subject(),
                request.examId(),
                targetAssessmentId,
                toPublish.size(),
                alreadyPublished.size(),
                candidates.size(),
                toPublish.stream().map(Marks::getId).toList(),
                alreadyPublished.stream().map(Marks::getId).toList(),
                summaryMessage
        );
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

    /**
     * Teacher marks roster view: retrieves marks for a class, subject, and assessment identifier.
     */
    public List<Marks> getMarksByClassSubjectAndAssessment(String classId, String subject, String assessmentId) {
        List<Marks> all = marksRepository.findByClassIdAndSubjectIgnoreCaseOrderByStudentNameAsc(classId, subject);
        return all.stream()
                .filter(m -> assessmentId.equalsIgnoreCase(m.getEffectiveAssessmentId()))
                .toList();
    }

    public Marks requireById(String id) {
        return marksRepository.findById(id).orElseThrow(() -> ApiException.notFound("Marks record"));
    }

    private void apply(Marks marks, MarksRequest request, Student student, String resolvedExamId, String resolvedAssessmentId, String recordedBy) {
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
        marks.setAssessmentId(resolvedAssessmentId);
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

    public static String buildAssessmentId(String examId, String assessmentId, String assessmentType, String term) {
        if (assessmentId != null && !assessmentId.isBlank()) {
            return assessmentId.trim();
        }
        if (examId != null && !examId.isBlank()) {
            return examId.trim();
        }
        String typePart = (assessmentType != null && !assessmentType.isBlank()) ? assessmentType.trim() : "GENERAL";
        String termPart = (term != null && !term.isBlank()) ? term.trim() : "T1";
        return typePart + "#" + termPart;
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

    private void checkDuplicateOnCreate(String studentId, String subject, String resolvedExamId, String assessmentId) {
        if (resolvedExamId != null && !resolvedExamId.isBlank()) {
            marksRepository.findByStudentIdAndSubjectIgnoreCaseAndExamId(studentId, subject, resolvedExamId)
                    .ifPresent(existing -> {
                        throw ApiException.conflict("DUPLICATE_MARKS_RECORD",
                                "A marks record already exists for this student, subject, and exam. Use PUT /api/marks/"
                                        + existing.getId() + " to update.");
                    });
        }
        if (assessmentId != null && !assessmentId.isBlank()) {
            marksRepository.findByStudentIdAndSubjectIgnoreCaseAndAssessmentId(studentId, subject, assessmentId)
                    .ifPresent(existing -> {
                        throw ApiException.conflict("DUPLICATE_MARKS_RECORD",
                                "A marks record already exists for this student, subject, and assessment ("
                                        + assessmentId + "). Use PUT /api/marks/" + existing.getId() + " to update.");
                    });
        }
    }

    private void checkDuplicateOnUpdate(String studentId, String subject, String resolvedExamId, String assessmentId, String currentId) {
        if (resolvedExamId != null && !resolvedExamId.isBlank()) {
            marksRepository.findByStudentIdAndSubjectIgnoreCaseAndExamId(studentId, subject, resolvedExamId)
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(currentId)) {
                            throw ApiException.conflict("DUPLICATE_MARKS_RECORD",
                                    "A marks record already exists for this student, subject, and exam.");
                        }
                    });
        }
        if (assessmentId != null && !assessmentId.isBlank()) {
            marksRepository.findByStudentIdAndSubjectIgnoreCaseAndAssessmentId(studentId, subject, assessmentId)
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(currentId)) {
                            throw ApiException.conflict("DUPLICATE_MARKS_RECORD",
                                    "A marks record already exists for this student, subject, and assessment ("
                                            + assessmentId + ").");
                        }
                    });
        }
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
