package com.sms.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sms.backend.model.TeacherProfile;

public interface TeacherProfileRepository extends MongoRepository<TeacherProfile, String> {
    Optional<TeacherProfile> findByEmail(String email);
    Optional<TeacherProfile> findByUserId(String userId);
}
