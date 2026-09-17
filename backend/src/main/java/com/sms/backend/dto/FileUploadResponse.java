package com.sms.backend.dto;

import java.time.Instant;

public record FileUploadResponse(
        String fileName,
        String fileUrl,
        String url,
        long size,
        Instant uploadedAt) {
}
