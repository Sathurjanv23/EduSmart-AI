package com.sms.backend.repository;

import com.sms.backend.model.FeeTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeTransactionRepository extends MongoRepository<FeeTransaction, String> {
    List<FeeTransaction> findByStudentId(String studentId);

    List<FeeTransaction> findByStatus(String status);

    FeeTransaction findByTransactionId(String transactionId);
}
