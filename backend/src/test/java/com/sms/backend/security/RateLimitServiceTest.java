package com.sms.backend.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.Test;

import com.sms.backend.exception.ApiException;

class RateLimitServiceTest {
    private static final Instant NOW = Instant.parse("2026-08-21T00:00:00Z");

    @Test
    void rejectsRequestsAfterConfiguredLimit() {
        Clock clock = mock(Clock.class);
        when(clock.instant()).thenReturn(NOW);
        RateLimitService service = new RateLimitService(Duration.ofMinutes(1), clock);

        service.check("login", "client", 2);
        service.check("login", "client", 2);
        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.check("login", "client", 2));

        assertEquals("RATE_LIMITED", exception.getCode());
    }

    @Test
    void startsFreshWindowAfterExpiry() {
        Clock clock = mock(Clock.class);
        when(clock.instant()).thenReturn(NOW, NOW.plusSeconds(61));
        RateLimitService service = new RateLimitService(Duration.ofMinutes(1), clock);

        service.check("login", "client", 1);

        assertDoesNotThrow(() -> service.check("login", "client", 1));
    }

    @Test
    void rejectsNonPositiveWindowAtStartup() {
        assertThrows(
                IllegalStateException.class,
                () -> new RateLimitService(Duration.ZERO, Clock.systemUTC()));
    }
}
