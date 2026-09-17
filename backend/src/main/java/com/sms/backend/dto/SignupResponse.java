package com.sms.backend.dto;

public class SignupResponse {

    private String message;
    private AuthenticatedUserResponse user;

    public SignupResponse() {
    }

    public SignupResponse(String message, AuthenticatedUserResponse user) {
        this.message = message;
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public AuthenticatedUserResponse getUser() {
        return user;
    }

    public void setUser(AuthenticatedUserResponse user) {
        this.user = user;
    }
}
