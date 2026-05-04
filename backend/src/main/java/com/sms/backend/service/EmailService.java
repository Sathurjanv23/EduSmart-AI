package com.sms.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Send registration OTP
     */
    public void sendRegistrationOtp(String toEmail, String otp) {
        String subject = "Verify Your Account — EduSmart";
        String content = "Welcome to EduSmart!<br><br>Your registration OTP code is: <b style='font-size: 24px; color: #10b981;'>" + otp + "</b><br><br>This code is valid for 1 minute.";
        sendHtmlEmail(toEmail, subject, "Registration OTP", content);
    }

    /**
     * Send login 2FA OTP
     */
    public void sendLoginOtp(String toEmail, String otp) {
        String subject = "Login 2FA OTP — EduSmart";
        String content = "Your login security code is: <b style='font-size: 24px; color: #3b82f6;'>" + otp + "</b><br><br>This code is valid for 1 minute.";
        sendHtmlEmail(toEmail, subject, "Login Verification", content);
    }

    /**
     * Send password reset link
     */
    public void sendPasswordResetLink(String toEmail, String resetLink) {
        String subject = "Reset Your Password — EduSmart";
        String content = "We received a request to reset your password. Click the button below to continue:<br><br>" +
                         "<a href='" + resetLink + "' style='display: inline-block; padding: 12px 24px; background-color: #f43f5e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;'>Reset Password</a>" +
                         "<br><br>This link is valid for 15 minutes.";
        sendHtmlEmail(toEmail, subject, "Password Reset", content);
    }

    private void sendHtmlEmail(String to, String subject, String title, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String htmlBody = "<html><body style='font-family: sans-serif; background-color: #f8fafc; padding: 20px;'>" +
                    "<div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>" +
                    "<div style='background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white;'>" +
                    "<h1 style='margin: 0; font-size: 28px;'>EduSmart</h1>" +
                    "<p style='margin: 10px 0 0; opacity: 0.9;'>Modern School Management System</p>" +
                    "</div>" +
                    "<div style='padding: 40px; color: #334155; line-height: 1.6;'>" +
                    "<h2 style='color: #1e293b; margin-top: 0;'>" + title + "</h2>" +
                    content +
                    "<br><br><hr style='border: none; border-top: 1px solid #f1f5f9;'>" +
                    "<p style='font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;'>" +
                    "© 2026 EduSmart · Anti-Gravity Edition<br>This is an automated security email." +
                    "</p></div></div></body></html>";

            helper.setFrom("sathu20030303@gmail.com", "EduSmart System");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("✅ Colorful HTML Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send HTML email to: {}. Error: {}", to, e.getMessage());
        }
    }
}
