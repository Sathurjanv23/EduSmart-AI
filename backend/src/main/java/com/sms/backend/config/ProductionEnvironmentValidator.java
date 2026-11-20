package com.sms.backend.config;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ProductionEnvironmentValidator {
    private static final Logger log = LoggerFactory.getLogger(ProductionEnvironmentValidator.class);

    private static final Set<String> WEAK_JWT_SECRETS = Set.of(
            "ci-only-secret-replace-me-32-characters-minimum",
            "replace-with-at-least-32-random-characters",
            "secret",
            "changeme",
            "password"
    );

    private final Environment environment;
    private final String jwtSecret;
    private final boolean cookieSecure;
    private final boolean demoDataEnabled;
    private final String corsOrigins;

    public ProductionEnvironmentValidator(
            Environment environment,
            @Value("${security.jwt.secret:}") String jwtSecret,
            @Value("${security.cookie.secure:false}") boolean cookieSecure,
            @Value("${app.seed.demo-data:false}") boolean demoDataEnabled,
            @Value("${app.cors.allowed-origins:}") String corsOrigins) {
        this.environment = environment;
        this.jwtSecret = jwtSecret;
        this.cookieSecure = cookieSecure;
        this.demoDataEnabled = demoDataEnabled;
        this.corsOrigins = corsOrigins;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validate() {
        if (!isProduction()) {
            log.info("Non-production environment active; strict production validations bypassed.");
            return;
        }

        log.info("Validating production environment security configuration...");

        // 1. JWT Secret entropy and minimum length
        if (jwtSecret == null || jwtSecret.trim().length() < 32) {
            throw new IllegalStateException("FATAL: JWT_SECRET must be at least 32 characters in production!");
        }
        if (WEAK_JWT_SECRETS.contains(jwtSecret.trim().toLowerCase())) {
            throw new IllegalStateException("FATAL: JWT_SECRET is set to an insecure default/sample value in production!");
        }

        // 2. Cookie Secure flag
        if (!cookieSecure) {
            throw new IllegalStateException("FATAL: COOKIE_SECURE must be true in production to prevent cookie leakage over plain HTTP!");
        }

        // 3. Demo seed data must be disabled
        if (demoDataEnabled) {
            throw new IllegalStateException("FATAL: APP_SEED_DEMO_DATA must be false in production environments!");
        }

        // 4. CORS Allowed Origins must not reference localhost
        List<String> origins = Arrays.stream(corsOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
        for (String origin : origins) {
            if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
                throw new IllegalStateException("FATAL: Production CORS origins cannot reference localhost/127.0.0.1: " + origin);
            }
        }

        log.info("Production security baseline configuration successfully verified.");
    }

    public boolean isProduction() {
        return Arrays.asList(environment.getActiveProfiles()).contains("prod");
    }
}
