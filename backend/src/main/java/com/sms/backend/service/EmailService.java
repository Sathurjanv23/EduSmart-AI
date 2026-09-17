package com.sms.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.sms.backend.exception.ApiException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String senderAddress;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:no-reply@campuscore.local}") String senderAddress) {
        this.mailSender = mailSender;
        this.senderAddress = senderAddress;
    }

    public void sendRegistrationOtp(String toEmail, String otp, long expirySeconds) {
        sendHtmlEmail(
                toEmail,
                "Verify your CampusCore account",
                "Registration verification",
                "Your verification code is <strong>" + otp + "</strong>. It expires in "
                        + expirySeconds + " seconds.");
    }

    public void sendLoginOtp(String toEmail, String otp, long expirySeconds) {
        sendHtmlEmail(
                toEmail,
                "CampusCore login verification",
                "Login verification",
                "Your login code is <strong>" + otp + "</strong>. It expires in "
                        + expirySeconds + " seconds.");
    }

    public void sendPasswordResetLink(String toEmail, String resetLink, long expiryMinutes) {
        sendHtmlEmail(
                toEmail,
                "Reset your CampusCore password",
                "Password reset",
                "Use this one-time link to reset your password: <a href=\"" + resetLink
                        + "\">Reset password</a>. It expires in " + expiryMinutes + " minutes.");
    }

    private void sendHtmlEmail(String to, String subject, String title, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(senderAddress, "CampusCore");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText("<html><body><h2>" + title + "</h2><p>" + content
                    + "</p><p>If you did not request this, you can ignore this message.</p></body></html>", true);
            mailSender.send(message);
            log.info("Authentication email sent successfully");
        } catch (MessagingException | MailException exception) {
            log.error("Authentication email delivery failed: {}. Check MAIL_HOST, MAIL_PORT, MAIL_USERNAME and MAIL_PASSWORD/APP_PASSWORD.",
                    exception.getClass().getSimpleName(), exception);
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "EMAIL_UNAVAILABLE",
                    "Email delivery is temporarily unavailable. Check the SMTP configuration or use MailHog for local development.");
        } catch (java.io.UnsupportedEncodingException exception) {
            throw new IllegalStateException("Configured sender name is invalid", exception);
        }
    }
}
