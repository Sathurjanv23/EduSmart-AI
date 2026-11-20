package com.sms.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginResponse {

    private String message;
    private String token;
    private AuthenticatedUserResponse user;

    public LoginResponse() {
    }

    public LoginResponse(String message, String token, AuthenticatedUserResponse user) {
        this.message = message;
        this.token = token;
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public AuthenticatedUserResponse getUser() {
        return user;
    }

    public void setUser(AuthenticatedUserResponse user) {
        this.user = user;
    }
}
