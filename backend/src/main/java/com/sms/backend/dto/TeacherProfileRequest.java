package com.sms.backend.dto;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TeacherProfileRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @Size(max = 100) List<@NotBlank @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9 _-]{0,39}$") String> assignedClassIds,
        @Size(max = 100) List<@NotBlank @Size(max = 80) String> assignedSubjects) {
}
