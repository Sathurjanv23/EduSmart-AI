package com.sms.backend.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sms.backend.dto.MarksRequest;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Marks;
import com.sms.backend.model.Student;
import com.sms.backend.repository.MarksRepository;
import com.sms.backend.repository.ExamRepository;
import com.sms.backend.repository.StudentRepository;

@Service
public class MarksService {
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
        validateExamLink(request, student);
        Marks marks = new Marks();
        apply(marks, request, student, recordedBy);
        marks.setRecordedAt(Instant.now());
        return marksRepository.save(marks);
    }

    public Marks updateMarks(String id, MarksRequest request, String recordedBy) {
        validateRange(request.marks(), request.totalMarks());
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ApiException.notFound("Student"));
        validateExamLink(request, student);
        Marks marks = requireById(id);
        apply(marks, request, student, recordedBy);
        return marksRepository.save(marks);
    }

    public List<Marks> getAllMarks() {
        return marksRepository.findAll();
    }

    public List<Marks> getMarksByStudent(String studentId) {
        return marksRepository.findByStudentIdOrderByRecordedAtDesc(studentId);
    }

    public Marks requireById(String id) {
        return marksRepository.findById(id).orElseThrow(() -> ApiException.notFound("Marks record"));
    }

    private void apply(Marks marks, MarksRequest request, Student student, String recordedBy) {
        marks.setStudentId(student.getId());
        marks.setStudentName(student.getName());
        marks.setParentEmail(student.getParentEmail());
        marks.setClassId(student.getStudentClass());
        marks.setSubject(request.subject().trim());
        marks.setMarks(request.marks());
        marks.setTotalMarks(request.totalMarks());
        marks.setExamId(request.examId() == null || request.examId().isBlank() ? null : request.examId().trim());
        marks.setRecordedBy(recordedBy);
        marks.setUpdatedAt(Instant.now());
    }

    private void validateRange(int marks, int totalMarks) {
        if (marks < 0 || totalMarks <= 0 || marks > totalMarks) {
            throw ApiException.badRequest("INVALID_MARKS", "Marks must be between zero and total marks");
        }
    }

    private void validateExamLink(MarksRequest request, Student student) {
        if (request.examId() == null || request.examId().isBlank()) {
            return;
        }
        com.sms.backend.model.Exam exam = examRepository.findById(request.examId().trim())
                .orElseThrow(() -> ApiException.notFound("Exam"));
        if (!student.getStudentClass().equals(exam.getClassId())
                || !request.subject().equalsIgnoreCase(exam.getSubject())) {
            throw ApiException.badRequest(
                    "EXAM_OWNERSHIP_MISMATCH",
                    "Exam must belong to the selected student's class and subject");
        }
    }
}
