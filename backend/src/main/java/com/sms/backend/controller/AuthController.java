package com.sms.backend.controller;

import java.security.Principal;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.AuthenticatedUserResponse;
import com.sms.backend.dto.ForgotPasswordRequest;
import com.sms.backend.dto.LoginRequest;
import com.sms.backend.dto.LoginResponse;
import com.sms.backend.dto.ResendOtpRequest;
import com.sms.backend.dto.ResetPasswordRequest;
import com.sms.backend.dto.SignupRequest;
import com.sms.backend.dto.SignupResponse;
import com.sms.backend.dto.VerifyOtpRequest;
import com.sms.backend.security.CookieService;
import com.sms.backend.security.RateLimitService;
import com.sms.backend.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.web.csrf.CsrfToken;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final RateLimitService rateLimitService;
    private final CookieService cookieService;
    private final int loginLimit;
    private final int otpLimit;
    private final int passwordResetLimit;

    public AuthController(
            AuthService authService,
            RateLimitService rateLimitService,
            CookieService cookieService,
            @Value("${app.auth.login-rate-limit:10}") int loginLimit,
            @Value("${app.auth.otp-rate-limit:10}") int otpLimit,
            @Value("${app.auth.password-reset-rate-limit:5}") int passwordResetLimit) {
        if (loginLimit <= 0 || otpLimit <= 0 || passwordResetLimit <= 0) {
            throw new IllegalStateException("Authentication rate limits must be positive");
        }
        this.authService = authService;
        this.rateLimitService = rateLimitService;
        this.cookieService = cookieService;
        this.loginLimit = loginLimit;
        this.otpLimit = otpLimit;
        this.passwordResetLimit = passwordResetLimit;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest) {
        rateLimitService.check("login", clientKey(servletRequest, request.getEmail()), loginLimit);
        return authService.login(request);
    }

    @PostMapping({"/signup", "/register"})
    public ResponseEntity<SignupResponse> signup(
            @Valid @RequestBody SignupRequest request,
            HttpServletRequest servletRequest) {
        rateLimitService.check("signup", clientKey(servletRequest, request.getEmail()), otpLimit);
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.signup(request));
    }

    @PostMapping("/verify-otp")
    public LoginResponse verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        rateLimitService.check("verify-otp", clientKey(servletRequest, request.getEmail()), otpLimit);
        return authService.verifyOtp(request, servletResponse);
    }

    @PostMapping("/logout")
    public Map<String, String> logout(
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        authService.logout(servletRequest, servletResponse);
        return Map.of("message", "Logged out successfully");
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(HttpServletRequest request, HttpServletResponse response) {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken == null) {
            csrfToken = (CsrfToken) request.getAttribute("_csrf");
        }
        if (csrfToken != null) {
            cookieService.attachCsrfCookie(response, csrfToken.getToken());

            return Map.of(
                    "token", csrfToken.getToken(),
                    "headerName", csrfToken.getHeaderName(),
                    "parameterName", csrfToken.getParameterName());
        }
        return Map.of();
    }

    @PostMapping("/resend-otp")
    public Map<String, String> resendOtp(
            @Valid @RequestBody ResendOtpRequest request,
            HttpServletRequest servletRequest) {
        rateLimitService.check("resend-otp", clientKey(servletRequest, request.getEmail()), otpLimit);
        return Map.of("message", authService.resendOtp(request));
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest) {
        rateLimitService.check("forgot-password", clientKey(servletRequest, request.getEmail()), passwordResetLimit);
        return Map.of("message", authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest) {
        rateLimitService.check("reset-password", servletRequest.getRemoteAddr(), passwordResetLimit);
        return Map.of("message", authService.resetPassword(request));
    }

    @GetMapping("/me")
    public AuthenticatedUserResponse me(Principal principal) {
        return authService.getCurrentUser(principal.getName());
    }

    private String clientKey(HttpServletRequest request, String email) {
        return request.getRemoteAddr() + '|' + email.trim().toLowerCase(Locale.ROOT);
    }
}
