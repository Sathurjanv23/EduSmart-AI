package com.sms.backend.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.sms.backend.repository.RevokedTokenRepository;

class RevokedTokenServiceTest {
    private RevokedTokenRepository repository;
    private RevokedTokenService service;

    @BeforeEach
    void setUp() {
        repository = mock(RevokedTokenRepository.class);
        service = new RevokedTokenService(repository);
    }

    @Test
    void revokeMarksTokenAsRevoked() {
        String tokenId = "token-uuid-123";
        assertFalse(service.isRevoked(tokenId));

        service.revoke(tokenId, Instant.now().plusSeconds(3600));
        assertTrue(service.isRevoked(tokenId));
    }

    @Test
    void expiredRevocationCleansUp() {
        String tokenId = "expired-token-uuid";
        // Revoke with past timestamp
        service.revoke(tokenId, Instant.now().minusSeconds(10));
        assertFalse(service.isRevoked(tokenId));
    }

    @Test
    void blankOrNullTokenReturnsFalse() {
        assertFalse(service.isRevoked(null));
        assertFalse(service.isRevoked(""));
        assertFalse(service.isRevoked("   "));
    }
}
