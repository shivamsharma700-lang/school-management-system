package com.schoolgroup.sms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {
    }

    public record RefreshRequest(@NotBlank String refreshToken) {
    }

    public record ForgotPasswordRequest(@NotBlank @Email String email) {
    }

    public record ResetPasswordRequest(
            @NotBlank String token,
            @NotBlank @Size(min = 10) String newPassword
    ) {
    }

    public record TokenResponse(
            String accessToken,
            String refreshToken,
            Instant expiresAt,
            UserSummary user
    ) {
    }

    public record UserSummary(
            UUID id,
            String email,
            String username,
            String fullName,
            String role,
            UUID branchId,
            String branchName
    ) {
    }
}
