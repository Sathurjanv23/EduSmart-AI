package com.sms.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.sms.backend.dto.FeeSummaryResponse;
import com.sms.backend.model.FeeTransaction;
import com.sms.backend.model.Student;
import com.sms.backend.repository.FeeStructureRepository;
import com.sms.backend.repository.FeeTransactionRepository;
import com.sms.backend.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
class FeeTransactionServiceTest {
    @Mock FeeTransactionRepository transactionRepository;
    @Mock FeeStructureRepository structureRepository;
    @Mock StudentRepository studentRepository;

    private FeeTransactionService service;

    @BeforeEach
    void setUp() {
        service = new FeeTransactionService(
                transactionRepository, structureRepository, studentRepository, "LKR");
    }

    @Test
    void summaryCalculatesPaidAndOutstandingAmounts() {
        FeeTransaction paid = transaction("1000.00", "1000.00", "PAID");
        FeeTransaction partial = transaction("500.00", "200.00", "PARTIAL");
        when(studentRepository.findById("student-1")).thenReturn(Optional.of(new Student()));
        when(transactionRepository.findByStudentId("student-1")).thenReturn(List.of(paid, partial));

        FeeSummaryResponse summary = service.getSummary("student-1");

        assertEquals(new BigDecimal("1500.00"), summary.totalCharged());
        assertEquals(new BigDecimal("1200.00"), summary.totalPaid());
        assertEquals(new BigDecimal("300.00"), summary.outstandingBalance());
        assertEquals("LKR", summary.currency());
    }

    private FeeTransaction transaction(String amount, String paid, String status) {
        FeeTransaction transaction = new FeeTransaction();
        transaction.setAmount(new BigDecimal(amount));
        transaction.setPaidAmount(new BigDecimal(paid));
        transaction.setStatus(status);
        return transaction;
    }
}
