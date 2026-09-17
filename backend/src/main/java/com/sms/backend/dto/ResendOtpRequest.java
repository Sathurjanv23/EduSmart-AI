package com.sms.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ResendOtpRequest {

    @NotBlank
    @Email
    @Size(max = 254)
    private String email;

    @NotBlank
    @Pattern(regexp = "REGISTER|LOGIN_2FA", message = "Unsupported OTP purpose")
    private String purpose; // "REGISTER" or "LOGIN_2FA"

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
}
