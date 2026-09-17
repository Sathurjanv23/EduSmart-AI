package com.sms.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sms.backend.model.Marks;

public interface MarksRepository extends MongoRepository<Marks, String> {
    List<Marks> findByStudentIdOrderByRecordedAtDesc(String studentId);
    List<Marks> findByClassId(String classId);
}
