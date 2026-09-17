package com.sms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.sms.backend.model.Student;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByEmail(String email);
    List<Student> findByParentEmail(String parentEmail);
    List<Student> findByStudentClass(String studentClass);
    Page<Student> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, String email, Pageable pageable);
}
