package com.sms.backend.repository;

import com.sms.backend.model.Exam;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepository extends MongoRepository<Exam, String> {
    List<Exam> findByClassId(String classId);

    List<Exam> findBySubject(String subject);

    List<Exam> findByStatus(String status);
}
