package com.sms.backend.service;

import com.sms.backend.model.Question;
import com.sms.backend.dto.QuestionDTO;
import com.sms.backend.repository.QuestionRepository;
import com.sms.backend.exception.ApiException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

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
        return requireById(id);
    }

    public Question updateQuestion(String id, QuestionDTO dto) {
        Question question = requireById(id);
        question.setQuestionText(dto.getQuestionText());
        question.setOptions(dto.getOptions());
        question.setCorrectAnswer(dto.getCorrectAnswer());
        question.setMarks(dto.getMarks());
        question.setDifficulty(dto.getDifficulty());
        question.setUpdatedAt(LocalDateTime.now());
        return questionRepository.save(question);
    }

    public void deleteQuestion(String id) {
        questionRepository.delete(requireById(id));
    }

    public Boolean checkAnswer(String questionId, String studentAnswer) {
        Question question = requireById(questionId);
        return question.getCorrectAnswer() != null && question.getCorrectAnswer().equals(studentAnswer);
    }

    private Question requireById(String id) {
        return questionRepository.findById(id).orElseThrow(() -> ApiException.notFound("Question"));
    }
}
