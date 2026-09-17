package com.sms.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminCreateUserRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.#_-]).{8,128}$",
                message = "Password must be 8-128 characters and include uppercase, lowercase, number, and special character") String password,
        @NotBlank @Pattern(regexp = "(?i)ADMIN|TEACHER|STUDENT|PARENT", message = "Unsupported role") String role) {
}
