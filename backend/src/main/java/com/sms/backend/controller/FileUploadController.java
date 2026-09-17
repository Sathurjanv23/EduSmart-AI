package com.sms.backend.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sms.backend.dto.FileUploadResponse;
import com.sms.backend.exception.ApiException;
import com.sms.backend.service.FileStorageService;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {
    private final FileStorageService fileStorageService;
    private final int maxFilesPerRequest;

    public FileUploadController(
            FileStorageService fileStorageService,
            @Value("${file.upload.max-files-per-request:10}") int maxFilesPerRequest) {
        if (maxFilesPerRequest <= 0) {
            throw new IllegalStateException("Upload file-count limit must be positive");
        }
        this.fileStorageService = fileStorageService;
        this.maxFilesPerRequest = maxFilesPerRequest;
    }

    @PostMapping
    public FileUploadResponse upload(@RequestParam("file") MultipartFile file) {
        return fileStorageService.store(file);
    }

    @PostMapping("/multiple")
    public Map<String, Object> uploadMultiple(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw ApiException.badRequest("EMPTY_UPLOAD", "At least one file is required");
        }
        if (files.length > maxFilesPerRequest) {
            throw ApiException.badRequest(
                    "TOO_MANY_FILES",
                    "Too many files in one upload request");
        }
        List<FileUploadResponse> uploaded = Arrays.stream(files).map(fileStorageService::store).toList();
        return Map.of("uploadedFiles", uploaded, "totalUploaded", uploaded.size());
    }

    @DeleteMapping("/{fileName:.+}")
    public Map<String, String> delete(@PathVariable String fileName) {
        fileStorageService.delete(fileName);
        return Map.of("message", "File deleted successfully");
    }
}
