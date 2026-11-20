package com.sms.backend.security;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class CookieService {
    private final String cookieName;
    private final boolean cookieSecure;
    private final String sameSite;
    private final String domain;
    private final long expirationMs;

    public CookieService(
            @Value("${security.cookie.name:sms_session}") String cookieName,
            @Value("${security.cookie.secure:false}") boolean cookieSecure,
            @Value("${security.cookie.same-site:Lax}") String sameSite,
            @Value("${security.cookie.domain:}") String domain,
            @Value("${security.jwt.expiration-ms:86400000}") long expirationMs) {
        this.cookieName = cookieName;
        this.cookieSecure = cookieSecure;
        this.sameSite = sameSite;
        this.domain = domain != null && !domain.isBlank() ? domain.trim() : null;
        this.expirationMs = expirationMs;
    }

    public String getCookieName() {
        return cookieName;
    }

    public boolean isCookieSecure() {
        return cookieSecure;
    }

    public String getSameSite() {
        return sameSite;
    }

    public void attachSessionCookie(HttpServletResponse response, String token) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ofMillis(expirationMs));
        if (domain != null) {
            builder.domain(domain);
        }
        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }

    public void clearSessionCookie(HttpServletResponse response) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO);
        if (domain != null) {
            builder.domain(domain);
        }
        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());
    }

    public Optional<String> extractToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(val -> val != null && !val.isBlank())
                .findFirst();
    }
}
