package com.sms.backend.config;

import java.io.IOException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sms.backend.exception.ApiErrorResponse;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtFilter jwtFilter;
    private final ObjectMapper objectMapper;

    public SecurityConfig(JwtFilter jwtFilter, ObjectMapper objectMapper) {
        this.jwtFilter = jwtFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public FilterRegistrationBean<JwtFilter> disableContainerJwtFilterRegistration(JwtFilter filter) {
        FilterRegistrationBean<JwtFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) -> writeSecurityError(
                    response, 401, "UNAUTHORIZED", "Authentication is required", request.getRequestURI()))
                .accessDeniedHandler((request, response, exception) -> writeSecurityError(
                    response, 403, "FORBIDDEN", "You are not allowed to access this resource", request.getRequestURI())))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/api/auth/login", "/api/auth/signup", "/api/auth/register",
                    "/api/auth/verify-otp", "/api/auth/resend-otp",
                    "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info", "/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                .requestMatchers("/api/auth/me").authenticated()

                .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                .requestMatchers("/api/teacher/**").hasAnyAuthority("TEACHER", "ADMIN")
                .requestMatchers("/api/student/**").hasAnyAuthority("STUDENT", "ADMIN")
                .requestMatchers("/api/parent/**", "/api/parents/**").hasAnyAuthority("PARENT", "ADMIN")
                .requestMatchers("/api/ml/**").hasAnyAuthority("ADMIN", "TEACHER")

                .requestMatchers(HttpMethod.POST, "/api/students/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/students/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/students/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/students/**").hasAnyAuthority("ADMIN", "TEACHER", "STUDENT", "PARENT")

                .requestMatchers(HttpMethod.POST, "/api/attendance/**", "/api/marks/**").hasAnyAuthority("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/attendance/**", "/api/marks/**").hasAnyAuthority("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.GET, "/api/attendance/**", "/api/marks/**").hasAnyAuthority("ADMIN", "TEACHER", "STUDENT", "PARENT")

                .requestMatchers(HttpMethod.POST, "/api/assignments/submissions").hasAuthority("STUDENT")
                .requestMatchers(HttpMethod.PATCH, "/api/assignments/submissions/*/grade").hasAnyAuthority("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.GET, "/api/assignments/submissions/**").hasAnyAuthority("ADMIN", "TEACHER", "STUDENT", "PARENT")
                .requestMatchers(HttpMethod.POST, "/api/assignments/**").hasAnyAuthority("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/assignments/**").hasAnyAuthority("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/assignments/**").hasAnyAuthority("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.GET, "/api/assignments/**").hasAnyAuthority("ADMIN", "TEACHER", "STUDENT", "PARENT")

                .requestMatchers(HttpMethod.GET, "/api/fee-transactions/**", "/api/fee-structure/**").hasAnyAuthority("ADMIN", "STUDENT", "PARENT")
                .requestMatchers("/api/fee-transactions/**", "/api/fee-structure/**", "/api/transport/**").hasAuthority("ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/upload").hasAnyAuthority("ADMIN", "TEACHER", "STUDENT")
                .requestMatchers(HttpMethod.POST, "/api/upload/multiple").hasAnyAuthority("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/upload/**").hasAuthority("ADMIN")
                .requestMatchers("/uploads/**").authenticated()

                .requestMatchers(HttpMethod.GET, "/api/announcements/**", "/api/exams/**",
                    "/api/library/books/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/timetables/**", "/api/events/**")
                    .hasAnyAuthority("ADMIN", "TEACHER")
                .requestMatchers("/api/announcements/**", "/api/exams/**", "/api/timetables/**",
                    "/api/events/**").hasAnyAuthority("ADMIN", "TEACHER")
                .requestMatchers("/api/activities/**", "/api/questions/**").hasAuthority("ADMIN")
                .requestMatchers("/api/library/books/**").hasAuthority("ADMIN")
                .requestMatchers("/api/library/issues/**", "/api/report-cards/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/notifications/user/*").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/notifications/*/read", "/api/notifications/user/*/read-all").authenticated()
                .requestMatchers("/api/messages/**", "/api/notifications/**").hasAuthority("ADMIN")
                .anyRequest().denyAll())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private void writeSecurityError(
            HttpServletResponse response,
            int status,
            String code,
            String message,
            String path) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), ApiErrorResponse.of(status, code, message, path));
    }
}
