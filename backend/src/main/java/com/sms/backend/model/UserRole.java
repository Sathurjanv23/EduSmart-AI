package com.sms.backend.model;

import java.util.Locale;

public enum UserRole {
    ADMIN,
    TEACHER,
    STUDENT,
    PARENT;

    public static UserRole from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Unsupported role");
        }
    }

    public boolean isPublicRegistrationRole() {
        return this == STUDENT || this == PARENT;
    }
}
