package com.sms.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.FeeSummaryResponse;
import com.sms.backend.dto.FeeTransactionDTO;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.FeeTransaction;
import com.sms.backend.model.Student;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.FeeTransactionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/fee-transactions")
public class FeeTransactionController {
    private final FeeTransactionService feeTransactionService;
    private final AcademicAccessService accessService;

    public FeeTransactionController(
            FeeTransactionService feeTransactionService,
            AcademicAccessService accessService) {
        this.feeTransactionService = feeTransactionService;
        this.accessService = accessService;
    }

    @GetMapping
    public List<FeeTransaction> getTransactions(
            @RequestParam(required = false) String studentId,
            Authentication authentication) {
        if (studentId != null && !studentId.isBlank()) {
            accessService.requireStudentAccess(authentication, studentId);
            return feeTransactionService.getStudentTransactions(studentId);
        }
        if (accessService.hasAuthority(authentication, "ADMIN")) {
            return feeTransactionService.getAllTransactions();
        }
        if (accessService.hasAuthority(authentication, "STUDENT")) {
            return feeTransactionService.getStudentTransactions(accessService.currentStudent(authentication).getId());
        }
        throw ApiException.badRequest("STUDENT_REQUIRED", "A studentId is required for parent access");
    }

    @GetMapping("/me")
    public List<FeeTransaction> myTransactions(Authentication authentication) {
        Student student = accessService.currentStudent(authentication);
        return feeTransactionService.getStudentTransactions(student.getId());
    }

    @GetMapping("/student/{studentId}")
    public List<FeeTransaction> studentTransactions(
            @PathVariable String studentId,
            Authentication authentication) {
        accessService.requireStudentAccess(authentication, studentId);
        return feeTransactionService.getStudentTransactions(studentId);
    }

    @GetMapping("/summary")
    public FeeSummaryResponse mySummary(Authentication authentication) {
        return feeTransactionService.getSummary(accessService.currentStudent(authentication).getId());
    }

    @GetMapping("/student/{studentId}/summary")
    public FeeSummaryResponse studentSummary(
            @PathVariable String studentId,
            Authentication authentication) {
        accessService.requireStudentAccess(authentication, studentId);
        return feeTransactionService.getSummary(studentId);
    }

    @PostMapping
    public ResponseEntity<FeeTransaction> recordPayment(
            @Valid @RequestBody FeeTransactionDTO request,
            Authentication authentication) {
        accessService.requireAdmin(authentication);
        FeeTransaction transaction = feeTransactionService.recordPayment(request, authentication.getName());
        return ResponseEntity.created(URI.create("/api/fee-transactions/" + transaction.getId())).body(transaction);
    }
}
