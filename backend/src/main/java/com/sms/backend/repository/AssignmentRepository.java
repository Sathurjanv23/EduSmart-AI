package com.sms.backend.repository;

import com.sms.backend.model.Assignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends MongoRepository<Assignment, String> {
    List<Assignment> findByClassId(String classId);

    List<Assignment> findBySubject(String subject);

    List<Assignment> findByStatus(String status);

    List<Assignment> findByCreatedBy(String createdBy);
}
