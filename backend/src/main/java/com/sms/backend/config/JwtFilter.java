package com.sms.backend.config;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.sms.backend.model.User;
import com.sms.backend.repository.UserRepository;
import com.sms.backend.security.CookieService;
import com.sms.backend.security.RevokedTokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CookieService cookieService;
    private final RevokedTokenService revokedTokenService;

    public JwtFilter(
            JwtUtil jwtUtil,
            UserRepository userRepository,
            CookieService cookieService,
            RevokedTokenService revokedTokenService) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.cookieService = cookieService;
        this.revokedTokenService = revokedTokenService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = extractToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (jwtUtil.isTokenValid(token)) {
                String tokenId = jwtUtil.extractTokenId(token);
                if (!revokedTokenService.isRevoked(tokenId)) {
                    String email = jwtUtil.extractEmail(token).toLowerCase(Locale.ROOT);
                    User user = userRepository.findByEmail(email).orElse(null);
                    if (user != null
                            && user.getRole() != null
                            && user.isEmailVerified()
                            && "ACTIVE".equals(user.getStatus())
                            && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        List.of(new SimpleGrantedAuthority(user.getRole().name())));
                        authentication.setDetails(user.getId());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } else {
                    SecurityContextHolder.clearContext();
                }
            }
        } catch (RuntimeException exception) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // 1. Session Cookie (primary browser session mechanism)
        String cookieToken = cookieService.extractToken(request).orElse(null);
        if (cookieToken != null) {
            return cookieToken;
        }

        // 2. Authorization Bearer header (programmatic / test client fallback)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }
}
