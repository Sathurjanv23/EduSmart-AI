package com.sms.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import com.sms.backend.dto.FileUploadResponse;
import com.sms.backend.exception.ApiException;

class FileStorageServiceTest {
    @TempDir
    Path uploadDirectory;

    @Test
    void storesValidatedFileUnderServerGeneratedUuid() {
        FileStorageService service = service();
        MockMultipartFile file = new MockMultipartFile(
                "file", "lesson.pdf", "application/pdf",
                "%PDF-1.4\nsynthetic test document".getBytes(StandardCharsets.US_ASCII));

        FileUploadResponse response = service.store(file);

        assertTrue(response.fileName().matches(
                "[0-9a-f-]{36}\\.pdf"));
        assertEquals("/uploads/" + response.fileName(), response.fileUrl());
        assertTrue(Files.isRegularFile(uploadDirectory.resolve(response.fileName())));
    }

    @Test
    void rejectsContentWhoseSignatureDoesNotMatchExtension() {
        FileStorageService service = service();
        MockMultipartFile file = new MockMultipartFile(
                "file", "spoofed.pdf", "application/pdf",
                "not a PDF".getBytes(StandardCharsets.US_ASCII));

        ApiException exception = assertThrows(ApiException.class, () -> service.store(file));

        assertEquals("FILE_SIGNATURE_MISMATCH", exception.getCode());
    }

    @Test
    void rejectsTraversalAndNonUuidDeleteNames() {
        ApiException exception = assertThrows(
                ApiException.class,
                () -> service().delete("../lesson.pdf"));

        assertEquals("INVALID_FILE_NAME", exception.getCode());
    }

    private FileStorageService service() {
        return new FileStorageService(
                uploadDirectory.toString(),
                1024,
                "pdf,png,jpg,jpeg,doc,docx,txt");
    }
}
