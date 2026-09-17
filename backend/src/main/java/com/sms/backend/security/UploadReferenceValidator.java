package com.sms.backend.security;

import java.util.regex.Pattern;

import com.sms.backend.exception.ApiException;

public final class UploadReferenceValidator {
    private static final Pattern STORED_UPLOAD = Pattern.compile(
            "^/uploads/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\.(?i:pdf|png|jpg|jpeg|doc|docx|txt)$");

    private UploadReferenceValidator() {
    }

    public static String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (!STORED_UPLOAD.matcher(normalized).matches()) {
            throw ApiException.badRequest(
                    "INVALID_UPLOAD_REFERENCE",
                    "File references must point to a file created by the upload API");
        }
        return normalized;
    }
}
