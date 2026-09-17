package com.sms.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.sms.backend.exception.ApiException;

@Service
public class IdentityAccessService {
    public void requireSelfOrAdmin(Authentication authentication, String userId) {
        if (hasAuthority(authentication, "ADMIN")) {
            return;
        }
        Object authenticatedUserId = authentication == null ? null : authentication.getDetails();
        if (authenticatedUserId == null || !userId.equals(authenticatedUserId.toString())) {
            throw ApiException.forbidden("You may only access your own notifications");
        }
    }

    public boolean hasAuthority(Authentication authentication, String authority) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(item -> authority.equals(item.getAuthority()));
    }

    public String currentUserKey(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw ApiException.forbidden("Authenticated user identity is required");
        }
        Object details = authentication.getDetails();
        if (details instanceof String value && !value.isBlank()) {
            return value;
        }
        return authentication.getName();
    }
}
