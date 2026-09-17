package com.sms.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sms.backend.dto.FeeSummaryResponse;
import com.sms.backend.dto.FeeTransactionDTO;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.FeeTransaction;
import com.sms.backend.model.FeeStructure;
import com.sms.backend.model.Student;
import com.sms.backend.repository.FeeStructureRepository;
import com.sms.backend.repository.FeeTransactionRepository;
import com.sms.backend.repository.StudentRepository;

@Service
public class FeeTransactionService {
    private final FeeTransactionRepository transactionRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final StudentRepository studentRepository;
    private final String currency;

    public FeeTransactionService(
            FeeTransactionRepository transactionRepository,
            FeeStructureRepository feeStructureRepository,
            StudentRepository studentRepository,
            @Value("${app.fees.currency:LKR}") String currency) {
        this.transactionRepository = transactionRepository;
        this.feeStructureRepository = feeStructureRepository;
        this.studentRepository = studentRepository;
        this.currency = currency.trim().toUpperCase(Locale.ROOT);
    }

    public FeeTransaction recordPayment(FeeTransactionDTO dto, String createdBy) {
        Student student = studentRepository.findById(dto.studentId())
                .orElseThrow(() -> ApiException.notFound("Student"));
        FeeStructure structure = feeStructureRepository.findById(dto.feeStructureId())
                .orElseThrow(() -> ApiException.notFound("Fee structure"));
        if (structure.getClassName() == null
                || !structure.getClassName().equalsIgnoreCase(student.getStudentClass())) {
            throw ApiException.badRequest(
                    "FEE_STRUCTURE_MISMATCH",
                    "Fee structure does not apply to the selected student's class");
        }
        if (dto.paidAmount().compareTo(dto.amount()) > 0) {
            throw ApiException.badRequest("INVALID_PAYMENT_AMOUNT", "Paid amount cannot exceed the charged amount");
        }

        String mode = dto.paymentMode().toUpperCase(Locale.ROOT);
        boolean unverifiedOnline = "ONLINE".equals(mode);
        FeeTransaction transaction = new FeeTransaction();
        transaction.setStudentId(dto.studentId());
        transaction.setFeeStructureId(dto.feeStructureId());
        transaction.setAmount(dto.amount());
        transaction.setPaidAmount(unverifiedOnline ? BigDecimal.ZERO : dto.paidAmount());
        transaction.setCurrency(currency);
        transaction.setPaymentMode(mode);
        transaction.setPaymentGateway(normalizeOptional(dto.paymentGateway()));
        transaction.setTransactionId(normalizeOptional(dto.transactionId()) == null
                ? "SMS-" + UUID.randomUUID() : dto.transactionId().trim());
        transaction.setDueDate(dto.dueDate());
        transaction.setCreatedBy(createdBy);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());

        if (unverifiedOnline) {
            transaction.setStatus("PENDING");
        } else if (transaction.getPaidAmount().compareTo(transaction.getAmount()) == 0) {
            transaction.setStatus("PAID");
            transaction.setPaidDate(LocalDateTime.now());
        } else if (transaction.getPaidAmount().signum() > 0) {
            transaction.setStatus("PARTIAL");
            transaction.setPaidDate(LocalDateTime.now());
        } else {
            transaction.setStatus("PENDING");
        }
        return transactionRepository.save(transaction);
    }

    public List<FeeTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<FeeTransaction> getStudentTransactions(String studentId) {
        return transactionRepository.findByStudentId(studentId);
    }

    public FeeSummaryResponse getSummary(String studentId) {
        studentRepository.findById(studentId).orElseThrow(() -> ApiException.notFound("Student"));
        List<FeeTransaction> transactions = transactionRepository.findByStudentId(studentId);
        BigDecimal charged = transactions.stream()
                .map(FeeTransaction::getAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal paid = transactions.stream()
                .filter(transaction -> "PAID".equals(transaction.getStatus()) || "PARTIAL".equals(transaction.getStatus()))
                .map(FeeTransaction::getPaidAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long pending = transactions.stream().filter(transaction -> "PENDING".equals(transaction.getStatus())).count();
        return new FeeSummaryResponse(studentId, currency, charged, paid, charged.subtract(paid).max(BigDecimal.ZERO), pending);
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
