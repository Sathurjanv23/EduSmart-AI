package com.sms.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FeeTransactionDTO(
        @NotBlank @Size(max = 100) String studentId,
        @NotBlank @Size(max = 100) String feeStructureId,
        @NotNull @DecimalMin(value = "0.01") @Digits(integer = 12, fraction = 2) BigDecimal amount,
        @NotNull @DecimalMin(value = "0.00") @Digits(integer = 12, fraction = 2) BigDecimal paidAmount,
        @NotBlank @Pattern(regexp = "CASH|CHEQUE|ONLINE|TEST", message = "Unsupported payment mode") String paymentMode,
        @Size(max = 40) String paymentGateway,
        @Size(max = 100) String transactionId,
        LocalDateTime dueDate) {
}
