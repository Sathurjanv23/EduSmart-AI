package com.sms.backend.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Stores hashed OTPs with expiry for:
 *  - REGISTER  : email verification after signup
 *  - LOGIN_2FA : two-factor authentication during login
 *  - FORGOT    : password reset (not OTP-based, uses token)
 */
@Document(collection = "otp_store")
@CompoundIndex(name = "otp_email_purpose_unique", def = "{'email': 1, 'purpose': 1}", unique = true)
public class OtpStore {

    @Id
    private String id;

    @Indexed
    private String email;
    private String hashedOtp;        // BCrypt-hashed 6-digit OTP
    @Indexed(expireAfterSeconds = 0)
    private Instant expiresAt; // 1 minute from creation
    private String purpose;          // "REGISTER" | "LOGIN_2FA"
    private int attempts = 0;        // track wrong attempts (max 5)

    public OtpStore() {}

    public OtpStore(String email, String hashedOtp, Instant expiresAt, String purpose) {
        this.email = email;
        this.hashedOtp = hashedOtp;
        this.expiresAt = expiresAt;
        this.purpose = purpose;
        this.attempts = 0;
    }

    // ===== GETTERS & SETTERS =====
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getHashedOtp() { return hashedOtp; }
    public void setHashedOtp(String hashedOtp) { this.hashedOtp = hashedOtp; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
}
