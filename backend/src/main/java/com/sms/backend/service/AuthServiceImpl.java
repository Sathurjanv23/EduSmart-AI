package com.sms.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.sms.backend.config.JwtUtil;
import com.sms.backend.dto.AuthenticatedUserResponse;
import com.sms.backend.dto.ForgotPasswordRequest;
import com.sms.backend.dto.LoginRequest;
import com.sms.backend.dto.LoginResponse;
import com.sms.backend.dto.ResendOtpRequest;
import com.sms.backend.dto.ResetPasswordRequest;
import com.sms.backend.dto.SignupRequest;
import com.sms.backend.dto.SignupResponse;
import com.sms.backend.dto.VerifyOtpRequest;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.OtpStore;
import com.sms.backend.model.User;
import com.sms.backend.model.UserRole;
import com.sms.backend.repository.OtpRepository;
import com.sms.backend.repository.UserRepository;
import com.sms.backend.security.CookieService;
import com.sms.backend.security.RevokedTokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthServiceImpl implements AuthService {
    private static final String GENERIC_RESET_MESSAGE =
            "If an account exists for that email, a password reset link has been sent.";
    private static final String GENERIC_RESEND_MESSAGE =
            "If the account is eligible, a new OTP has been sent.";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final String dummyPasswordHash;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final CookieService cookieService;
    private final RevokedTokenService revokedTokenService;
    private final long otpExpirySeconds;
    private final int maxAttempts;
    private final long resetTokenExpiryMinutes;
    private final String frontendUrl;

    public AuthServiceImpl(
            UserRepository userRepository,
            OtpRepository otpRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            EmailService emailService,
            CookieService cookieService,
            RevokedTokenService revokedTokenService,
            @Value("${app.auth.otp-expiry-seconds:300}") long otpExpirySeconds,
            @Value("${app.auth.otp-max-attempts:5}") int maxAttempts,
            @Value("${app.auth.reset-token-expiry-minutes:15}") long resetTokenExpiryMinutes,
            @Value("${app.frontend-url}") String frontendUrl) {
        if (otpExpirySeconds <= 0 || maxAttempts <= 0 || resetTokenExpiryMinutes <= 0) {
            throw new IllegalStateException("Authentication timeout and attempt settings must be positive");
        }
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.dummyPasswordHash = passwordEncoder.encode("timing-only-" + UUID.randomUUID());
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.cookieService = cookieService;
        this.revokedTokenService = revokedTokenService;
        this.otpExpirySeconds = otpExpirySeconds;
        this.maxAttempts = maxAttempts;
        this.resetTokenExpiryMinutes = resetTokenExpiryMinutes;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email).orElse(null);
        String passwordHash = user == null ? dummyPasswordHash : user.getPassword();
        if (!passwordEncoder.matches(request.getPassword(), passwordHash) || user == null) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        if (!user.isEmailVerified() || !"ACTIVE".equals(user.getStatus())) {
            if (!user.isEmailVerified()) {
                String otp = generateAndStoreOtp(user.getEmail(), "REGISTER");
                emailService.sendRegistrationOtp(user.getEmail(), otp, otpExpirySeconds);
                throw new ApiException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED", "Email verification is required");
            }
            throw ApiException.forbidden("Account is not active");
        }

        String otp = generateAndStoreOtp(user.getEmail(), "LOGIN_2FA");
        emailService.sendLoginOtp(user.getEmail(), otp, otpExpirySeconds);
        return new LoginResponse("OTP_SENT", null, null);
    }

    @Override
    public SignupResponse signup(SignupRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("EMAIL_EXISTS", "Email already exists");
        }

        UserRole role;
        try {
            role = UserRole.from(request.getRole());
        } catch (IllegalArgumentException exception) {
            throw ApiException.badRequest("INVALID_ROLE", "Public registration only supports STUDENT or PARENT");
        }
        if (!role.isPublicRegistrationRole()) {
            throw ApiException.forbidden("Privileged accounts can only be created by an administrator");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setStatus("PENDING");
        user.setEmailVerified(false);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        String otp = generateAndStoreOtp(user.getEmail(), "REGISTER");
        emailService.sendRegistrationOtp(user.getEmail(), otp, otpExpirySeconds);
        return new SignupResponse("OTP_SENT", AuthenticatedUserResponse.from(user));
    }

    @Override
    public LoginResponse verifyOtp(VerifyOtpRequest request) {
        return verifyOtp(request, null);
    }

    @Override
    public LoginResponse verifyOtp(VerifyOtpRequest request, HttpServletResponse response) {
        String email = normalizeEmail(request.getEmail());
        String purpose = normalizePurpose(request.getPurpose());
        OtpStore otpStore = otpRepository.findByEmailAndPurpose(email, purpose)
                .orElseThrow(() -> ApiException.badRequest("OTP_NOT_FOUND", "OTP not found. Please request a new one."));

        if (!Instant.now().isBefore(otpStore.getExpiresAt())) {
            otpRepository.deleteByEmailAndPurpose(email, purpose);
            throw new ApiException(HttpStatus.GONE, "OTP_EXPIRED", "OTP has expired. Please request a new one.");
        }
        if (otpStore.getAttempts() >= maxAttempts) {
            otpRepository.deleteByEmailAndPurpose(email, purpose);
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "OTP_ATTEMPTS_EXCEEDED",
                    "Too many incorrect attempts. Please request a new OTP.");
        }
        if (!passwordEncoder.matches(request.getOtp(), otpStore.getHashedOtp())) {
            otpStore.setAttempts(otpStore.getAttempts() + 1);
            otpRepository.save(otpStore);
            throw ApiException.badRequest("INVALID_OTP", "Invalid OTP");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Account is not available"));
        if ("REGISTER".equals(purpose)) {
            user.setEmailVerified(true);
            user.setStatus("ACTIVE");
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
        } else if (!user.isEmailVerified() || !"ACTIVE".equals(user.getStatus())) {
            throw ApiException.forbidden("Account is not active");
        }

        otpRepository.deleteByEmailAndPurpose(email, purpose);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        if (response != null) {
            cookieService.attachSessionCookie(response, token);
            // Session token is strictly set via HttpOnly cookie; omitted from JSON response body
            return new LoginResponse("Login successful", null, AuthenticatedUserResponse.from(user));
        }
        return new LoginResponse("Login successful", token, AuthenticatedUserResponse.from(user));
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String token = cookieService.extractToken(request).orElse(null);
        if (token == null && request != null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }
        if (token != null) {
            String tokenId = jwtUtil.extractTokenId(token);
            Instant expiresAt = jwtUtil.extractExpiration(token);
            revokedTokenService.revoke(tokenId, expiresAt);
        }
        if (response != null) {
            cookieService.clearSessionCookie(response);
        }
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @Override
    public String resendOtp(ResendOtpRequest request) {
        String email = normalizeEmail(request.getEmail());
        String purpose = normalizePurpose(request.getPurpose());
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return GENERIC_RESEND_MESSAGE;
        }
        boolean eligible = "REGISTER".equals(purpose)
                ? !user.isEmailVerified()
                : user.isEmailVerified() && "ACTIVE".equals(user.getStatus());
        if (!eligible) {
            return GENERIC_RESEND_MESSAGE;
        }

        String otp = generateAndStoreOtp(email, purpose);
        if ("REGISTER".equals(purpose)) {
            emailService.sendRegistrationOtp(email, otp, otpExpirySeconds);
        } else {
            emailService.sendLoginOtp(email, otp, otpExpirySeconds);
        }
        return GENERIC_RESEND_MESSAGE;
    }

    @Override
    public String forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !user.isEmailVerified() || !"ACTIVE".equals(user.getStatus())) {
            return GENERIC_RESET_MESSAGE;
        }

        String rawToken = UUID.randomUUID().toString() + UUID.randomUUID();
        user.setResetToken(hashToken(rawToken));
        user.setResetTokenExpiry(Instant.now().plus(resetTokenExpiryMinutes, ChronoUnit.MINUTES).toEpochMilli());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
        emailService.sendPasswordResetLink(user.getEmail(), resetLink, resetTokenExpiryMinutes);
        return GENERIC_RESET_MESSAGE;
    }

    @Override
    public String resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(hashToken(request.getToken()))
                .orElseThrow(() -> ApiException.badRequest("INVALID_RESET_TOKEN", "Reset token is invalid or expired"));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry() <= System.currentTimeMillis()) {
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw ApiException.badRequest("INVALID_RESET_TOKEN", "Reset token is invalid or expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return "Password reset successful";
    }

    @Override
    public AuthenticatedUserResponse getCurrentUser(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .map(AuthenticatedUserResponse::from)
                .orElseThrow(() -> ApiException.unauthorized("Authenticated account no longer exists"));
    }

    private String generateAndStoreOtp(String email, String purpose) {
        otpRepository.deleteByEmailAndPurpose(email, purpose);
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        OtpStore store = new OtpStore(
                email,
                passwordEncoder.encode(otp),
                Instant.now().plus(otpExpirySeconds, ChronoUnit.SECONDS),
                purpose);
        otpRepository.save(store);
        return otp;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePurpose(String purpose) {
        String normalized = purpose.trim().toUpperCase(Locale.ROOT);
        if (!"REGISTER".equals(normalized) && !"LOGIN_2FA".equals(normalized)) {
            throw ApiException.badRequest("INVALID_OTP_PURPOSE", "Unsupported OTP purpose");
        }
        return normalized;
    }

    private String hashToken(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
