package com.schoolgroup.sms.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

/**
 * Correct 401 vs 403 semantics for the API.
 *
 * Spring Security's stateless default answers 403 for *both* "not authenticated"
 * and "not permitted". That broke silent token refresh on the client: the access
 * token expires after 20 minutes, every subsequent call came back 403, and the
 * browser client (which refreshes only on 401) neither refreshed nor redirected
 * — leaving the user on a dashboard rendering zeros with no prompt to sign in.
 *
 * 401 => credentials are missing/expired/invalid; the client should refresh or
 *        send the user to /login.
 * 403 => the caller is authenticated but the role or branch forbids the action.
 */
@Component
public class RestAuthEntryPoint implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper mapper;

    public RestAuthEntryPoint(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        write(request, response, HttpStatus.UNAUTHORIZED, "Authentication required");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        write(request, response, HttpStatus.FORBIDDEN, "Access denied");
    }

    private void write(HttpServletRequest request, HttpServletResponse response,
                       HttpStatus status, String message) throws IOException {
        if (response.isCommitted()) {
            return;
        }
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        mapper.writeValue(response.getOutputStream(), new Body(
                Instant.now().toString(), status.value(), status.getReasonPhrase(),
                message, request.getRequestURI()));
    }

    private record Body(String timestamp, int status, String error, String message, String path) {
    }
}
