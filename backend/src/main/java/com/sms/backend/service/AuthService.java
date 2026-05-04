package com.sms.backend.service;

import com.sms.backend.dto.*;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    SignupResponse signup(SignupRequest request);

    String forgotPassword(ForgotPasswordRequest request);

    String resetPassword(ResetPasswordRequest request);

    // ── OTP ───────────────────────────────────────────────────────
    LoginResponse verifyOtp(VerifyOtpRequest request);

    String resendOtp(ResendOtpRequest request);
}