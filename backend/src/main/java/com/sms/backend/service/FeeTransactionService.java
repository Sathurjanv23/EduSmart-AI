package com.sms.backend.service;

import com.sms.backend.model.FeeTransaction;
import com.sms.backend.dto.FeeTransactionDTO;
import com.sms.backend.repository.FeeTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FeeTransactionService {

    @Autowired
    private FeeTransactionRepository feeTransactionRepository;

    public FeeTransaction recordPayment(FeeTransactionDTO dto) {
        FeeTransaction transaction = new FeeTransaction();
        transaction.setStudentId(dto.getStudentId());
        transaction.setFeeStructureId(dto.getFeeStructureId());
        transaction.setAmount(dto.getAmount());
        transaction.setPaidAmount(dto.getPaidAmount());
        transaction.setPaymentMode(dto.getPaymentMode());
        transaction.setPaymentGateway(dto.getPaymentGateway());
        transaction.setTransactionId(dto.getTransactionId());
        transaction.setStatus(dto.getStatus());
        transaction.setPaidDate(LocalDateTime.now());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());
        return feeTransactionRepository.save(transaction);
    }

    public List<FeeTransaction> getStudentTransactions(String studentId) {
        return feeTransactionRepository.findByStudentId(studentId);
    }

    public Double getTotalPaidByStudent(String studentId) {
        List<FeeTransaction> transactions = feeTransactionRepository.findByStudentId(studentId);
        return transactions.stream()
                .filter(t -> t.getStatus().equals("PAID"))
                .mapToDouble(FeeTransaction::getPaidAmount)
                .sum();
    }

    public List<FeeTransaction> getPendingTransactions() {
        return feeTransactionRepository.findByStatus("PENDING");
    }

    public FeeTransaction verifyPayment(String transactionId) {
        return feeTransactionRepository.findByTransactionId(transactionId);
    }
}
