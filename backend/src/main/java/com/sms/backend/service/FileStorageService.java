package com.sms.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sms.backend.dto.FileUploadResponse;
import com.sms.backend.exception.ApiException;

@Service
public class FileStorageService {
    private static final Map<String, Set<String>> CONTENT_TYPES = Map.of(
            "pdf", Set.of("application/pdf"),
            "png", Set.of("image/png"),
            "jpg", Set.of("image/jpeg"),
            "jpeg", Set.of("image/jpeg"),
            "doc", Set.of("application/msword"),
            "docx", Set.of("application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            "txt", Set.of("text/plain"));

    private final Path uploadRoot;
    private final long maxFileSize;
    private final Set<String> allowedExtensions;

    public FileStorageService(
            @Value("${file.upload.dir:./uploads}") String uploadDirectory,
            @Value("${file.upload.max-size:10485760}") long maxFileSize,
            @Value("${file.upload.allowed-extensions:pdf,png,jpg,jpeg,doc,docx,txt}") String extensions) {
        this.uploadRoot = Path.of(uploadDirectory).toAbsolutePath().normalize();
        this.maxFileSize = maxFileSize;
        this.allowedExtensions = Arrays.stream(extensions.split(","))
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .filter(CONTENT_TYPES::containsKey)
                .collect(Collectors.toUnmodifiableSet());
        if (maxFileSize <= 0 || allowedExtensions.isEmpty()) {
            throw new IllegalStateException("Upload size and allowed extensions must be configured");
        }
    }

    public FileUploadResponse store(MultipartFile file) {
        validate(file);
        String extension = extension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + "." + extension;
        Path destination = resolve(storedName);
        try {
            Files.createDirectories(uploadRoot);
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, destination);
            }
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_STORAGE_FAILED", "File could not be stored");
        }
        String url = "/uploads/" + storedName;
        return new FileUploadResponse(storedName, url, url, file.getSize(), Instant.now());
    }

    public static final String FILE_NAME_PATTERN =
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
                    + "\\.(?i:pdf|png|jpg|jpeg|doc|docx|txt)$";

    public boolean isValidFileName(String fileName) {
        return fileName != null && fileName.matches(FILE_NAME_PATTERN);
    }

    public Resource loadAsResource(String fileName) {
        if (!isValidFileName(fileName)) {
            throw ApiException.badRequest("INVALID_FILE_NAME", "File name is invalid");
        }
        Path path = resolve(fileName);
        try {
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw ApiException.notFound("File");
            }
            return resource;
        } catch (MalformedURLException exception) {
            throw ApiException.badRequest("INVALID_FILE_PATH", "File path is invalid");
        }
    }

    public String getContentType(String fileName) {
        String ext = extension(fileName);
        Set<String> types = CONTENT_TYPES.get(ext);
        if (types != null && !types.isEmpty()) {
            return types.iterator().next();
        }
        return "application/octet-stream";
    }

    public void delete(String fileName) {
        if (!isValidFileName(fileName)) {
            throw ApiException.badRequest("INVALID_FILE_NAME", "File name is invalid");
        }
        Path path = resolve(fileName);
        try {
            if (!Files.deleteIfExists(path)) {
                throw ApiException.notFound("File");
            }
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_DELETE_FAILED", "File could not be deleted");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("EMPTY_FILE", "File is empty");
        }
        if (file.getSize() > maxFileSize) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "File exceeds the configured size limit");
        }
        String extension = extension(file.getOriginalFilename());
        if (!allowedExtensions.contains(extension)) {
            throw ApiException.badRequest("UNSUPPORTED_FILE_TYPE", "File type is not allowed");
        }
        String contentType = file.getContentType() == null
                ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!CONTENT_TYPES.get(extension).contains(contentType)) {
            throw ApiException.badRequest("FILE_TYPE_MISMATCH", "File content type does not match its extension");
        }
        try (InputStream input = file.getInputStream()) {
            byte[] header = input.readNBytes(8);
            if (!signatureMatches(extension, header)) {
                throw ApiException.badRequest("FILE_SIGNATURE_MISMATCH", "File content does not match its extension");
            }
        } catch (IOException exception) {
            throw ApiException.badRequest("UNREADABLE_FILE", "File could not be read");
        }
    }

    private boolean signatureMatches(String extension, byte[] header) {
        return switch (extension) {
            case "pdf" -> startsWith(header, new byte[] {0x25, 0x50, 0x44, 0x46});
            case "png" -> startsWith(header, new byte[] {(byte) 0x89, 0x50, 0x4e, 0x47});
            case "jpg", "jpeg" -> startsWith(header, new byte[] {(byte) 0xff, (byte) 0xd8, (byte) 0xff});
            case "doc" -> startsWith(header, new byte[] {(byte) 0xd0, (byte) 0xcf, 0x11, (byte) 0xe0});
            case "docx" -> startsWith(header, new byte[] {0x50, 0x4b, 0x03, 0x04});
            case "txt" -> header.length > 0 && Arrays.stream(toUnsigned(header)).noneMatch(value -> value == 0);
            default -> false;
        };
    }

    private int[] toUnsigned(byte[] bytes) {
        int[] values = new int[bytes.length];
        for (int i = 0; i < bytes.length; i++) {
            values[i] = Byte.toUnsignedInt(bytes[i]);
        }
        return values;
    }

    private boolean startsWith(byte[] actual, byte[] expected) {
        if (actual.length < expected.length) {
            return false;
        }
        for (int i = 0; i < expected.length; i++) {
            if (actual[i] != expected[i]) {
                return false;
            }
        }
        return true;
    }

    private String extension(String originalName) {
        if (originalName == null) {
            throw ApiException.badRequest("INVALID_FILE_NAME", "File name is required");
        }
        String normalizedName = originalName.replace('\\', '/');
        String safeName = normalizedName.substring(normalizedName.lastIndexOf('/') + 1);
        int dot = safeName.lastIndexOf('.');
        if (dot <= 0 || dot == safeName.length() - 1) {
            throw ApiException.badRequest("INVALID_FILE_NAME", "File extension is required");
        }
        return safeName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private Path resolve(String fileName) {
        Path path = uploadRoot.resolve(fileName).normalize();
        if (!path.startsWith(uploadRoot)) {
            throw ApiException.badRequest("INVALID_FILE_PATH", "File path is invalid");
        }
        return path;
    }
}
