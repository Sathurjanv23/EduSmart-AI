package com.sms.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.sms.backend.model.RevokedToken;

@Repository
public interface RevokedTokenRepository extends MongoRepository<RevokedToken, String> {
}
