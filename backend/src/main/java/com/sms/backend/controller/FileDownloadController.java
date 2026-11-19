package com.sms.backend.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.service.FileStorageService;

@RestController
public class FileDownloadController {
    private final FileStorageService fileStorageService;
    private final AcademicAccessService accessService;

    public FileDownloadController(FileStorageService fileStorageService, AcademicAccessService accessService) {
        this.fileStorageService = fileStorageService;
        this.accessService = accessService;
    }

    @GetMapping({"/uploads/{fileName:.+}", "/api/uploads/{fileName:.+}"})
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileName,
            Authentication authentication) {
        accessService.requireFileAccess(authentication, fileName);
        Resource resource = fileStorageService.loadAsResource(fileName);
        String contentType = fileStorageService.getContentType(fileName);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-store, no-cache, must-revalidate")
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }
}
