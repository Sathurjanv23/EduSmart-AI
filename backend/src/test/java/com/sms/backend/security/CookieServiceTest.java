package com.sms.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.http.Cookie;

class CookieServiceTest {
    private CookieService cookieService;

    @BeforeEach
    void setUp() {
        cookieService = new CookieService("sms_session", false, "Lax", "", 86400000);
    }

    @Test
    void attachSessionCookieSetsHttpOnlyAndCorrectAttributes() {
        MockHttpServletResponse response = new MockHttpServletResponse();
        cookieService.attachSessionCookie(response, "test-jwt-value");

        String setCookie = response.getHeader("Set-Cookie");
        assertTrue(setCookie != null && setCookie.contains("sms_session=test-jwt-value"));
        assertTrue(setCookie.contains("HttpOnly"));
        assertTrue(setCookie.contains("SameSite=Lax"));
        assertTrue(setCookie.contains("Path=/"));
        assertTrue(setCookie.contains("Max-Age=86400"));
    }

    @Test
    void clearSessionCookieSetsMaxAgeZero() {
        MockHttpServletResponse response = new MockHttpServletResponse();
        cookieService.clearSessionCookie(response);

        String setCookie = response.getHeader("Set-Cookie");
        assertTrue(setCookie != null && setCookie.contains("sms_session="));
        assertTrue(setCookie.contains("Max-Age=0"));
        assertTrue(setCookie.contains("HttpOnly"));
    }

    @Test
    void extractTokenReturnsCookieValue() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("sms_session", "extracted-jwt"));

        Optional<String> token = cookieService.extractToken(request);
        assertTrue(token.isPresent());
        assertEquals("extracted-jwt", token.get());
    }

    @Test
    void extractTokenReturnsEmptyWhenMissing() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        assertFalse(cookieService.extractToken(request).isPresent());

        request.setCookies(new Cookie("other_cookie", "value"));
        assertFalse(cookieService.extractToken(request).isPresent());
    }
}
