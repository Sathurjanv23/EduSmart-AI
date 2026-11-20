package com.sms.backend.config;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

class ProductionEnvironmentValidatorTest {

    @Test
    void shouldBypassValidationWhenNotInProductionProfile() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"default", "dev"});

        ProductionEnvironmentValidator validator = new ProductionEnvironmentValidator(
                env,
                "short",
                false,
                true,
                "http://localhost:3000"
        );

        assertDoesNotThrow(validator::validate);
    }

    @Test
    void shouldThrowIfJwtSecretTooShortInProduction() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});

        ProductionEnvironmentValidator validator = new ProductionEnvironmentValidator(
                env,
                "too-short-secret",
                true,
                false,
                "https://sms.school.edu.lk"
        );

        IllegalStateException ex = assertThrows(IllegalStateException.class, validator::validate);
        assertTrue(ex.getMessage().contains("JWT_SECRET must be at least 32 characters"));
    }

    @Test
    void shouldThrowIfJwtSecretIsKnownSampleValueInProduction() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});

        ProductionEnvironmentValidator validator = new ProductionEnvironmentValidator(
                env,
                "ci-only-secret-replace-me-32-characters-minimum",
                true,
                false,
                "https://sms.school.edu.lk"
        );

        IllegalStateException ex = assertThrows(IllegalStateException.class, validator::validate);
        assertTrue(ex.getMessage().contains("insecure default/sample value"));
    }

    @Test
    void shouldThrowIfCookieSecureIsFalseInProduction() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});

        ProductionEnvironmentValidator validator = new ProductionEnvironmentValidator(
                env,
                "a-valid-production-secret-with-high-entropy-and-length-32+",
                false,
                false,
                "https://sms.school.edu.lk"
        );

        IllegalStateException ex = assertThrows(IllegalStateException.class, validator::validate);
        assertTrue(ex.getMessage().contains("COOKIE_SECURE must be true"));
    }

    @Test
    void shouldThrowIfDemoDataEnabledInProduction() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});

        ProductionEnvironmentValidator validator = new ProductionEnvironmentValidator(
                env,
                "a-valid-production-secret-with-high-entropy-and-length-32+",
                true,
                true,
                "https://sms.school.edu.lk"
        );

        IllegalStateException ex = assertThrows(IllegalStateException.class, validator::validate);
        assertTrue(ex.getMessage().contains("APP_SEED_DEMO_DATA must be false"));
    }

    @Test
    void shouldThrowIfCorsOriginsReferenceLocalhostInProduction() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});

        ProductionEnvironmentValidator validator = new ProductionEnvironmentValidator(
                env,
                "a-valid-production-secret-with-high-entropy-and-length-32+",
                true,
                false,
                "http://localhost:3000,https://sms.school.edu.lk"
        );

        IllegalStateException ex = assertThrows(IllegalStateException.class, validator::validate);
        assertTrue(ex.getMessage().contains("cannot reference localhost"));
    }

    @Test
    void shouldPassValidationWithValidProductionSettings() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[]{"prod"});

        ProductionEnvironmentValidator validator = new ProductionEnvironmentValidator(
                env,
                "a-valid-production-secret-with-high-entropy-and-length-32+",
                true,
                false,
                "https://sms.school.edu.lk"
        );

        assertDoesNotThrow(validator::validate);
    }
}
