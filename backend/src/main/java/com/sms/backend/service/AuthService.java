package com.sms.backend.service;

import com.sms.backend.dto.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    SignupResponse signup(SignupRequest request);

    String forgotPassword(ForgotPasswordRequest request);

    String resetPassword(ResetPasswordRequest request);

    // ── OTP ───────────────────────────────────────────────────────
    LoginResponse verifyOtp(VerifyOtpRequest request);

    LoginResponse verifyOtp(VerifyOtpRequest request, HttpServletResponse response);

    void logout(HttpServletRequest request, HttpServletResponse response);

    String resendOtp(ResendOtpRequest request);

    AuthenticatedUserResponse getCurrentUser(String email);
}
