package com.sms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sms.backend.model.Marks;

public interface MarksRepository extends MongoRepository<Marks, String> {
    List<Marks> findByStudentIdOrderByRecordedAtDesc(String studentId);
    List<Marks> findByClassId(String classId);

    // Queries for teacher roster / marks entry (Task 02.1 & 02.2)
    List<Marks> findByClassIdAndSubjectIgnoreCaseOrderByStudentNameAsc(String classId, String subject);
    List<Marks> findByClassIdAndSubjectIgnoreCaseAndExamIdOrderByStudentNameAsc(String classId, String subject, String examId);

    // Student & Parent portal query: only returns records in published status (Task 02.1 privacy foundation & Task 02.3/02.4)
    List<Marks> findByStudentIdAndStatusOrderByRecordedAtDesc(String studentId, String status);

    // Duplicate prevention checks
    Optional<Marks> findByStudentIdAndSubjectIgnoreCaseAndExamId(String studentId, String subject, String examId);
}
