package com.sms.backend.service;

import com.sms.backend.model.Question;
import com.sms.backend.dto.QuestionDTO;
import com.sms.backend.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    public Question createQuestion(QuestionDTO dto) {
        Question question = new Question();
        question.setExamId(dto.getExamId());
        question.setQuestionText(dto.getQuestionText());
        question.setQuestionType(dto.getQuestionType());
        question.setOptions(dto.getOptions());
        question.setCorrectAnswer(dto.getCorrectAnswer());
        question.setMarks(dto.getMarks());
        question.setDifficulty(dto.getDifficulty());
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        return questionRepository.save(question);
    }

    public List<Question> getQuestionsByExam(String examId) {
        return questionRepository.findByExamId(examId);
    }

    public Question getQuestionById(String id) {
        return questionRepository.findById(id).orElse(null);
    }

    public Question updateQuestion(String id, QuestionDTO dto) {
        Optional<Question> optional = questionRepository.findById(id);
        if (optional.isPresent()) {
            Question question = optional.get();
            question.setQuestionText(dto.getQuestionText());
            question.setOptions(dto.getOptions());
            question.setCorrectAnswer(dto.getCorrectAnswer());
            question.setMarks(dto.getMarks());
            question.setDifficulty(dto.getDifficulty());
            question.setUpdatedAt(LocalDateTime.now());
            return questionRepository.save(question);
        }
        return null;
    }

    public void deleteQuestion(String id) {
        questionRepository.deleteById(id);
    }

    public Boolean checkAnswer(String questionId, String studentAnswer) {
        Question question = questionRepository.findById(questionId).orElse(null);
        if (question != null) {
            return question.getCorrectAnswer().equals(studentAnswer);
        }
        return false;
    }
}
