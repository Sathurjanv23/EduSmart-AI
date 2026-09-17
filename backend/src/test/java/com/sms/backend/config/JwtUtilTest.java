package com.sms.backend.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class JwtUtilTest {
    private static final String SECRET = "test-secret-that-is-longer-than-thirty-two-bytes";
    private static final Instant NOW = Instant.parse("2026-08-21T00:00:00Z");

    @Test
    void signsAndValidatesTokenWithExpectedSubject() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 60_000, Clock.fixed(NOW, ZoneOffset.UTC));

        String token = jwtUtil.generateToken("student@example.test", "STUDENT");

        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals("student@example.test", jwtUtil.extractEmail(token));
        assertEquals("STUDENT", jwtUtil.extractClaims(token).get("role", String.class));
    }

    @Test
    void rejectsTokenAfterConfiguredExpiry() {
        Clock issuedAt = Clock.fixed(NOW, ZoneOffset.UTC);
        String token = new JwtUtil(SECRET, 1_000, issuedAt)
                .generateToken("student@example.test", "STUDENT");
        Clock afterExpiry = Clock.offset(issuedAt, Duration.ofSeconds(2));

        assertFalse(new JwtUtil(SECRET, 1_000, afterExpiry).isTokenValid(token));
    }

    @Test
    void rejectsWeakSecretsAtStartup() {
        assertThrows(
                IllegalStateException.class,
                () -> new JwtUtil("too-short", 60_000, Clock.systemUTC()));
    }
}
