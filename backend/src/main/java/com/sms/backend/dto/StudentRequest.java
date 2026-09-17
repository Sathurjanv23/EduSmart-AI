package com.sms.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StudentRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @JsonAlias("parent") @Email @Size(max = 254) String parentEmail,
        @JsonAlias("grade") @NotBlank @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9 _-]{0,39}$") String studentClass,
        @Pattern(regexp = "(?i)MALE|FEMALE|OTHER|PREFER_NOT_TO_SAY", message = "Unsupported gender") String gender) {
}
