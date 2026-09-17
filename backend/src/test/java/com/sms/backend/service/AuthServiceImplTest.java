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
import com.sms.backend.dto.SignupRequest;
import com.sms.backend.exception.ApiException;
import com.sms.backend.repository.OtpRepository;
import com.sms.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {
    @Mock UserRepository userRepository;
    @Mock OtpRepository otpRepository;
    @Mock BCryptPasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock EmailService emailService;

    private AuthServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImpl(
                userRepository, otpRepository, passwordEncoder, jwtUtil, emailService,
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
}
