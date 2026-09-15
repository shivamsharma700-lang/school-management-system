package com.schoolgroup.sms.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schoolgroup.sms.exception.ApiError;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MS = 60_000;
    /**
     * Attempts per client IP per minute. Configurable so the RBAC suite — which
     * legitimately signs in as every role from one address — is not throttled.
     */
    private final int limit;
    private final Map<String, Window> attempts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public LoginRateLimitFilter(ObjectMapper objectMapper,
                                @Value("${app.security.login-attempts-per-minute:10}") int limit) {
        this.objectMapper = objectMapper;
        this.limit = limit;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if ("POST".equalsIgnoreCase(request.getMethod()) && request.getRequestURI().endsWith("/api/auth/login")) {
            String key = request.getRemoteAddr();
            Window window = attempts.compute(key, (k, existing) -> {
                long now = System.currentTimeMillis();
                if (existing == null || now - existing.start > WINDOW_MS) {
                    return new Window(now, 1);
                }
                existing.count++;
                return existing;
            });
            if (window.count > limit) {
                response.setStatus(429);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                objectMapper.writeValue(response.getOutputStream(),
                        new ApiError(Instant.now(), 429, "Too Many Requests", "Too many login attempts", request.getRequestURI(), null));
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private static class Window {
        final long start;
        int count;

        Window(long start, int count) {
            this.start = start;
            this.count = count;
        }
    }
}
