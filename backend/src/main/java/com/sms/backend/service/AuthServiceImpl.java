package com.sms.backend.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.sms.backend.config.JwtUtil;
import com.sms.backend.dto.*;
import com.sms.backend.model.OtpStore;
import com.sms.backend.model.User;
import com.sms.backend.repository.OtpRepository;
import com.sms.backend.repository.UserRepository;

@Service
public class AuthServiceImpl implements AuthService {

    private static final int OTP_EXPIRY_MINUTES = 1;
    private static final int MAX_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthServiceImpl(UserRepository userRepository,
                           OtpRepository otpRepository,
                           BCryptPasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN — verify password, then send 2FA OTP
    // Returns a partial response (no JWT yet) until OTP is verified
    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            // Resend registration OTP and ask to verify email first
            String otp = generateAndStoreOtp(user.getEmail(), "REGISTER");
            emailService.sendRegistrationOtp(user.getEmail(), otp);
            throw new RuntimeException("EMAIL_NOT_VERIFIED");
        }

        // Send 2FA OTP
        String otp = generateAndStoreOtp(user.getEmail(), "LOGIN_2FA");
        emailService.sendLoginOtp(user.getEmail(), otp);

        // Return a response that signals frontend to show OTP screen
        LoginResponse response = new LoginResponse("OTP_SENT", null, null);
        return response;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SIGNUP — create PENDING user, send registration OTP
    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public SignupResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus("PENDING");
        user.setEmailVerified(false);

        userRepository.save(user);

        // Send registration OTP
        String otp = generateAndStoreOtp(user.getEmail(), "REGISTER");
        emailService.sendRegistrationOtp(user.getEmail(), otp);

        return new SignupResponse("OTP_SENT", user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFY OTP — handles both REGISTER and LOGIN_2FA
    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public LoginResponse verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        String purpose = request.getPurpose();

        OtpStore otpStore = otpRepository.findByEmailAndPurpose(email, purpose)
                .orElseThrow(() -> new RuntimeException("OTP not found. Please request a new one."));

        // Check expiry (using Instant for timezone-independent comparison)
        if (Instant.now().isAfter(otpStore.getExpiresAt())) {
            otpRepository.deleteByEmailAndPurpose(email, purpose);
            throw new RuntimeException("OTP_EXPIRED");
        }

        // Check attempt limit
        if (otpStore.getAttempts() >= MAX_ATTEMPTS) {
            otpRepository.deleteByEmailAndPurpose(email, purpose);
            throw new RuntimeException("Too many wrong attempts. Please request a new OTP.");
        }

        // Verify OTP
        if (!passwordEncoder.matches(request.getOtp(), otpStore.getHashedOtp())) {
            otpStore.setAttempts(otpStore.getAttempts() + 1);
            otpRepository.save(otpStore);
            int remaining = MAX_ATTEMPTS - otpStore.getAttempts();
            throw new RuntimeException("Invalid OTP. " + remaining + " attempts remaining.");
        }

        // ✅ OTP is correct — clean it up
        otpRepository.deleteByEmailAndPurpose(email, purpose);

        // Fetch user and update status if registration
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("REGISTER".equals(purpose)) {
            user.setEmailVerified(true);
            user.setStatus("ACTIVE");
            userRepository.save(user);
        }

        // Issue JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new LoginResponse("Login successful", token, user);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RESEND OTP
    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public String resendOtp(ResendOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        String purpose = request.getPurpose();

        // Delete any existing OTP
        otpRepository.deleteByEmailAndPurpose(email, purpose);

        String otp = generateAndStoreOtp(email, purpose);

        if ("REGISTER".equals(purpose)) {
            emailService.sendRegistrationOtp(email, otp);
        } else {
            emailService.sendLoginOtp(email, otp);
        }

        return "OTP resent successfully";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FORGOT PASSWORD
    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String resetToken = UUID.randomUUID().toString();
        long expiryTime = System.currentTimeMillis() + (1000L * 60 * 15); // 15 minutes

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiryTime);
        userRepository.save(user);

        String resetLink = "http://localhost:3001/reset-password?token=" + resetToken;
        emailService.sendPasswordResetLink(user.getEmail(), resetLink);

        return "Password reset link sent successfully to your email.";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RESET PASSWORD
    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry() < System.currentTimeMillis()) {
            throw new RuntimeException("Reset token expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return "Password reset successful";
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER: Generate + Store hashed OTP
    // ─────────────────────────────────────────────────────────────────────────
    private String generateAndStoreOtp(String email, String purpose) {
        // Delete old OTP for same purpose if exists
        otpRepository.deleteByEmailAndPurpose(email, purpose);

        // Generate secure 6-digit OTP
        SecureRandom rng = new SecureRandom();
        String otp = String.format("%06d", rng.nextInt(1_000_000));

        // Store hashed OTP
        OtpStore store = new OtpStore(
                email,
                passwordEncoder.encode(otp),
                Instant.now().plus(OTP_EXPIRY_MINUTES, ChronoUnit.MINUTES),
                purpose
        );
        otpRepository.save(store);

        return otp; // Return plain OTP to send in email
    }
}