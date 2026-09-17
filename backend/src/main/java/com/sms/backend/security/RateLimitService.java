package com.sms.backend.security;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.sms.backend.exception.ApiException;

@Service
public class RateLimitService {
    private static final int MAX_TRACKED_KEYS = 10_000;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final Duration windowDuration;
    private final Clock clock;

    @Autowired
    public RateLimitService(
            @Value("${app.auth.rate-limit-window-seconds:900}") long windowSeconds) {
        this(Duration.ofSeconds(windowSeconds), Clock.systemUTC());
    }

    RateLimitService(Duration windowDuration, Clock clock) {
        if (windowDuration == null || windowDuration.isZero() || windowDuration.isNegative()) {
            throw new IllegalStateException("Authentication rate-limit window must be positive");
        }
        this.windowDuration = windowDuration;
        this.clock = clock;
    }

    public void check(String operation, String clientKey, int limit) {
        if (limit <= 0) {
            throw new IllegalStateException("Authentication rate limits must be positive");
        }
        Instant now = clock.instant();
        String key = operation + ':' + clientKey;
        if (windows.size() >= MAX_TRACKED_KEYS && !windows.containsKey(key)) {
            windows.entrySet().removeIf(entry ->
                    !now.isBefore(entry.getValue().startedAt().plus(windowDuration)));
            if (windows.size() >= MAX_TRACKED_KEYS) {
                throw rateLimited();
            }
        }
        Window window = windows.compute(key, (ignored, existing) -> {
            if (existing == null || !now.isBefore(existing.startedAt().plus(windowDuration))) {
                return new Window(now, 1);
            }
            return new Window(existing.startedAt(), existing.count() + 1);
        });
        if (window.count() > limit) {
            throw rateLimited();
        }
    }

    private ApiException rateLimited() {
        return new ApiException(
                HttpStatus.TOO_MANY_REQUESTS,
                "RATE_LIMITED",
                "Too many authentication attempts. Please try again later.");
    }

    record Window(Instant startedAt, int count) {
    }
}
