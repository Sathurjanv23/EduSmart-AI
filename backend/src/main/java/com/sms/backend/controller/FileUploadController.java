package com.sms.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Value("${file.upload.dir:./uploads/}")
    private String uploadDir;

    @Value("${file.upload.max-size:10485760}")
    private long maxFileSize;

    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }

            if (file.getSize() > maxFileSize) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size exceeds limit"));
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            Map<String, Object> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", "/uploads/" + fileName);
            response.put("size", file.getSize());
            response.put("uploadedAt", new Date());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }

    @PostMapping("/multiple")
    public ResponseEntity<Map<String, Object>> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files) {
        List<Map<String, String>> uploadedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                if (!file.isEmpty() && file.getSize() <= maxFileSize) {
                    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    Path uploadPath = Paths.get(uploadDir);
                    Files.createDirectories(uploadPath);

                    Path filePath = uploadPath.resolve(fileName);
                    Files.write(filePath, file.getBytes());

                    Map<String, String> fileInfo = new HashMap<>();
                    fileInfo.put("fileName", fileName);
                    fileInfo.put("fileUrl", "/uploads/" + fileName);
                    uploadedFiles.add(fileInfo);
                }
            } catch (IOException e) {
                // Skip file on error
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("uploadedFiles", uploadedFiles);
        response.put("totalUploaded", uploadedFiles.size());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{fileName}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(filePath);
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "File deletion failed"));
        }
    }
}
