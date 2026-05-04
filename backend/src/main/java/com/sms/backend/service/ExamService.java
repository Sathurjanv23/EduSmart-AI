package com.sms.backend.service;

import com.sms.backend.model.Exam;
import com.sms.backend.dto.ExamDTO;
import com.sms.backend.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    public Exam createExam(ExamDTO dto) {
        Exam exam = new Exam();
        exam.setTitle(dto.getTitle());
        exam.setDescription(dto.getDescription());
        exam.setClassId(dto.getClassId());
        exam.setSubject(dto.getSubject());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        exam.setTotalMarks(dto.getTotalMarks());
        exam.setPassingMarks(dto.getPassingMarks());
        exam.setExamType(dto.getExamType());
        exam.setQuestionIds(dto.getQuestionIds());
        exam.setStatus("DRAFT");
        exam.setCreatedAt(LocalDateTime.now());
        exam.setUpdatedAt(LocalDateTime.now());
        return examRepository.save(exam);
    }

    public Exam publishExam(String examId) {
        Optional<Exam> optional = examRepository.findById(examId);
        if (optional.isPresent()) {
            Exam exam = optional.get();
            exam.setStatus("PUBLISHED");
            exam.setPublishedAt(LocalDateTime.now());
            exam.setUpdatedAt(LocalDateTime.now());
            return examRepository.save(exam);
        }
        return null;
    }

    public List<Exam> getExamsByClass(String classId) {
        return examRepository.findByClassId(classId);
    }

    public List<Exam> getExamsBySubject(String subject) {
        return examRepository.findBySubject(subject);
    }

    public Exam getExamById(String id) {
        return examRepository.findById(id).orElse(null);
    }

    public Exam updateExam(String id, ExamDTO dto) {
        Optional<Exam> optional = examRepository.findById(id);
        if (optional.isPresent()) {
            Exam exam = optional.get();
            exam.setTitle(dto.getTitle());
            exam.setDescription(dto.getDescription());
            exam.setStartTime(dto.getStartTime());
            exam.setEndTime(dto.getEndTime());
            exam.setTotalMarks(dto.getTotalMarks());
            exam.setPassingMarks(dto.getPassingMarks());
            exam.setUpdatedAt(LocalDateTime.now());
            return examRepository.save(exam);
        }
        return null;
    }

    public void deleteExam(String id) {
        examRepository.deleteById(id);
    }
}
