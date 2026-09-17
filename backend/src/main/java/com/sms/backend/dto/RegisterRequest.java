package com.sms.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Legacy alias retained for compatibility. New registration endpoints use
 * {@link SignupRequest}; keep the same input constraints if this DTO is reused.
 */
public class RegisterRequest {

    @NotBlank
    @Size(max = 100)
    private String name;
    @NotBlank
    @Email
    @Size(max = 254)
    private String email;
    @NotBlank
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.#_-]).{8,128}$",
            message = "Password must be 8-128 characters and include uppercase, lowercase, number, and special character")
    private String password;
    @NotBlank
    @Pattern(regexp = "(?i)STUDENT|PARENT", message = "Public registration only supports STUDENT or PARENT")
    private String role;

    public RegisterRequest() {
    }

    public RegisterRequest(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
