package com.sms.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.sms.backend.config.JwtUtil;
import com.sms.backend.dto.ForgotPasswordRequest;
import com.sms.backend.dto.LoginResponse;
import com.sms.backend.dto.SignupRequest;
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

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {
    @Mock UserRepository userRepository;
    @Mock OtpRepository otpRepository;
    @Mock BCryptPasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock EmailService emailService;
    @Mock CookieService cookieService;
    @Mock RevokedTokenService revokedTokenService;
    @Mock HttpServletRequest servletRequest;
    @Mock HttpServletResponse servletResponse;

    private AuthServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImpl(
                userRepository, otpRepository, passwordEncoder, jwtUtil, emailService,
                cookieService, revokedTokenService,
                300, 5, 15, "http://localhost:3000");
    }

    @Test
    void publicSignupCannotCreateAdmin() {
        SignupRequest request = new SignupRequest(
                "Attacker", "attacker@example.test", "Strong!Pass123", "ADMIN");

        ApiException exception = assertThrows(ApiException.class, () -> service.signup(request));

        assertEquals(403, exception.getStatus().value());
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void forgotPasswordDoesNotRevealMissingAccount() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("missing@example.test");
        when(userRepository.findByEmail("missing@example.test")).thenReturn(java.util.Optional.empty());

        String message = service.forgotPassword(request);

        assertEquals("If an account exists for that email, a password reset link has been sent.", message);
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(emailService, never()).sendPasswordResetLink(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void verifyOtpAttachesCookieAndOmitsTokenFromResponseBody() {
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail("user@example.test");
        request.setOtp("123456");
        request.setPurpose("LOGIN_2FA");

        OtpStore otpStore = new OtpStore(
                "user@example.test", "hashed-otp", java.time.Instant.now().plusSeconds(300), "LOGIN_2FA");
        when(otpRepository.findByEmailAndPurpose("user@example.test", "LOGIN_2FA"))
                .thenReturn(java.util.Optional.of(otpStore));
        when(passwordEncoder.matches("123456", "hashed-otp")).thenReturn(true);

        User user = new User();
        user.setEmail("user@example.test");
        user.setName("User");
        user.setRole(UserRole.STUDENT);
        user.setEmailVerified(true);
        user.setStatus("ACTIVE");
        when(userRepository.findByEmail("user@example.test")).thenReturn(java.util.Optional.of(user));
        when(jwtUtil.generateToken("user@example.test", "STUDENT")).thenReturn("generated-jwt-token");

        LoginResponse response = service.verifyOtp(request, servletResponse);

        assertEquals("Login successful", response.getMessage());
        org.junit.jupiter.api.Assertions.assertNull(response.getToken(), "Session token must not be in JSON response body");
        assertEquals("user@example.test", response.getUser().email());
        verify(cookieService).attachSessionCookie(servletResponse, "generated-jwt-token");
        verify(otpRepository).deleteByEmailAndPurpose("user@example.test", "LOGIN_2FA");
    }

    @Test
    void logoutRevokesTokenAndClearsCookie() {
        when(cookieService.extractToken(servletRequest)).thenReturn(java.util.Optional.of("session-jwt-token"));
        when(jwtUtil.extractTokenId("session-jwt-token")).thenReturn("token-id-123");
        java.time.Instant expiresAt = java.time.Instant.now().plusSeconds(3600);
        when(jwtUtil.extractExpiration("session-jwt-token")).thenReturn(expiresAt);

        service.logout(servletRequest, servletResponse);

        verify(revokedTokenService).revoke("token-id-123", expiresAt);
        verify(cookieService).clearSessionCookie(servletResponse);
    }
}
