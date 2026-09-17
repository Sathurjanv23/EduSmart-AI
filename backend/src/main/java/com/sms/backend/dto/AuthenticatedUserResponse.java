package com.sms.backend.dto;

import com.sms.backend.model.User;
import com.sms.backend.model.UserRole;

public record AuthenticatedUserResponse(
        String id,
        String name,
        String email,
        UserRole role,
        String status,
        boolean emailVerified) {

    public static AuthenticatedUserResponse from(User user) {
        return new AuthenticatedUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.isEmailVerified());
    }
}
