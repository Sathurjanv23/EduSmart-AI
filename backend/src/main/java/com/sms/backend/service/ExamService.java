package com.sms.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sms.backend.dto.ExamDTO;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Exam;
import com.sms.backend.repository.ExamRepository;

@Service
public class ExamService {
    private final ExamRepository examRepository;

    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public Exam createExam(ExamDTO dto, String createdBy) {
        validate(dto);
        Exam exam = new Exam();
        apply(exam, dto);
        exam.setCreatedBy(createdBy);
        exam.setStatus("DRAFT");
        exam.setCreatedAt(LocalDateTime.now());
        exam.setUpdatedAt(LocalDateTime.now());
        return examRepository.save(exam);
    }

    public Exam publishExam(String examId) {
        Exam exam = requireById(examId);
        exam.setStatus("PUBLISHED");
        exam.setPublishedAt(LocalDateTime.now());
        exam.setUpdatedAt(LocalDateTime.now());
        return examRepository.save(exam);
    }

    public List<Exam> getExamsByClass(String classId, boolean publishedOnly) {
        return publishedOnly
                ? examRepository.findByClassIdAndStatus(classId, "PUBLISHED")
                : examRepository.findByClassId(classId);
    }

    public List<Exam> getExamsBySubject(String subject) {
        return examRepository.findBySubject(subject);
    }

    public Exam requireById(String id) {
        return examRepository.findById(id).orElseThrow(() -> ApiException.notFound("Exam"));
    }

    public Exam updateExam(String id, ExamDTO dto) {
        validate(dto);
        Exam exam = requireById(id);
        apply(exam, dto);
        exam.setUpdatedAt(LocalDateTime.now());
        return examRepository.save(exam);
    }

    public void deleteExam(String id) {
        examRepository.delete(requireById(id));
    }

    private void apply(Exam exam, ExamDTO dto) {
        exam.setTitle(dto.getTitle().trim());
        exam.setDescription(dto.getDescription() == null ? null : dto.getDescription().trim());
        exam.setClassId(dto.getClassId().trim());
        exam.setSubject(dto.getSubject().trim());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        exam.setTotalMarks(dto.getTotalMarks());
        exam.setPassingMarks(dto.getPassingMarks());
        exam.setExamType(dto.getExamType());
        exam.setQuestionIds(dto.getQuestionIds() == null ? List.of() : List.copyOf(dto.getQuestionIds()));
    }

    private void validate(ExamDTO dto) {
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw ApiException.badRequest("INVALID_EXAM_TIME", "Exam end time must be after start time");
        }
        if (dto.getPassingMarks() > dto.getTotalMarks()) {
            throw ApiException.badRequest("INVALID_PASSING_MARKS", "Passing marks cannot exceed total marks");
        }
    }
}
