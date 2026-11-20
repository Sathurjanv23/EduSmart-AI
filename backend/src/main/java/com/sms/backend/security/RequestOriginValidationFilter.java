package com.sms.backend.security;

import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RequestOriginValidationFilter extends OncePerRequestFilter {
    private final Set<String> allowedOrigins;

    public RequestOriginValidationFilter(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String method = request.getMethod();
        // State-changing requests must validate Origin / Referer and Fetch Metadata
        if (HttpMethod.POST.matches(method) || HttpMethod.PUT.matches(method)
                || HttpMethod.PATCH.matches(method) || HttpMethod.DELETE.matches(method)) {

            String fetchSite = request.getHeader("Sec-Fetch-Site");
            if ("cross-site".equalsIgnoreCase(fetchSite)) {
                response.sendError(HttpStatus.FORBIDDEN.value(), "Cross-site request blocked by Fetch Metadata policy");
                return;
            }

            String origin = request.getHeader("Origin");
            if (origin != null && !origin.isBlank()) {
                if (!isAllowed(origin)) {
                    response.sendError(HttpStatus.FORBIDDEN.value(), "Origin not allowed");
                    return;
                }
            } else {
                String referer = request.getHeader("Referer");
                if (referer != null && !referer.isBlank()) {
                    try {
                        URI uri = URI.create(referer);
                        String refererOrigin = uri.getScheme() + "://" + uri.getAuthority();
                        if (!isAllowed(refererOrigin)) {
                            response.sendError(HttpStatus.FORBIDDEN.value(), "Referer origin not allowed");
                            return;
                        }
                    } catch (IllegalArgumentException ignored) {
                        response.sendError(HttpStatus.FORBIDDEN.value(), "Invalid Referer header");
                        return;
                    }
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean isAllowed(String origin) {
        String trimmed = origin.trim();
        return allowedOrigins.stream().anyMatch(allowed -> allowed.equalsIgnoreCase(trimmed));
    }
}
