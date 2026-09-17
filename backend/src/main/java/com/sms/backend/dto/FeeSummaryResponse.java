package com.sms.backend.dto;

import java.math.BigDecimal;

public record FeeSummaryResponse(
        String studentId,
        String currency,
        BigDecimal totalCharged,
        BigDecimal totalPaid,
        BigDecimal outstandingBalance,
        long pendingTransactions) {
}
