package com.sms.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.sms.backend.exception.ApiException;

class UploadReferenceValidatorTest {
    @Test
    void acceptsOnlyUploadApiReferences() {
        String reference = "/uploads/123e4567-e89b-12d3-a456-426614174000.pdf";

        assertEquals(reference, UploadReferenceValidator.normalizeOptional(reference));
    }

    @Test
    void rejectsExternalAndTraversalReferences() {
        assertThrows(ApiException.class,
                () -> UploadReferenceValidator.normalizeOptional("https://attacker.example/file.pdf"));
        assertThrows(ApiException.class,
                () -> UploadReferenceValidator.normalizeOptional("/uploads/../secret.pdf"));
        assertThrows(ApiException.class,
                () -> UploadReferenceValidator.normalizeOptional("//attacker.example/file.pdf"));
    }
}
