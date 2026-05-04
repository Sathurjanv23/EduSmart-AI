package com.sms.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.sms.backend.model.OtpStore;

public interface OtpRepository extends MongoRepository<OtpStore, String> {

    Optional<OtpStore> findByEmailAndPurpose(String email, String purpose);

    void deleteByEmailAndPurpose(String email, String purpose);
}
