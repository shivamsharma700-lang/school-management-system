package com.schoolgroup.sms.service;

import com.schoolgroup.sms.config.AppProperties;
import com.schoolgroup.sms.dto.AuthDtos;
import com.schoolgroup.sms.entity.RefreshToken;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.PasswordResetTokenRepository;
import com.schoolgroup.sms.repository.RefreshTokenRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import com.schoolgroup.sms.security.JwtService;
import com.schoolgroup.sms.entity.PasswordResetToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private final UserAccountRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AppProperties properties;
    private final AuditService audit;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserAccountRepository users,
                       RefreshTokenRepository refreshTokens,
                       PasswordResetTokenRepository resetTokens,
                       PasswordEncoder encoder,
                       JwtService jwtService,
                       AppProperties properties,
                       AuditService audit) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.resetTokens = resetTokens;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.properties = properties;
        this.audit = audit;
    }

    @Transactional
    public AuthDtos.TokenResponse login(AuthDtos.LoginRequest request) {
        UserAccount user = users.findByEmailIgnoreCase(request.username())
                .or(() -> users.findByUsernameIgnoreCase(request.username()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid credentials"));
        if (!"ACTIVE".equals(user.getStatus()) || !encoder.matches(request.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid credentials");
        }
        user.setLastLoginAt(Instant.now());
        audit.record("LOGIN", "USER", user.getId().toString(), null);
        return issue(user);
    }

    @Transactional
    public AuthDtos.TokenResponse refresh(String refreshToken) {
        String hash = sha256(refreshToken);
        RefreshToken stored = refreshTokens.findByTokenHash(hash)
                .orElseThrow(() -> ApiException.unauthorized("Invalid refresh token"));
        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.unauthorized("Invalid refresh token");
        }
        stored.setRevoked(true);
        return issue(stored.getUser());
    }

    @Transactional
    public void forgotPassword(String email) {
        users.findByEmailIgnoreCase(email).ifPresent(user -> {
            PasswordResetToken token = new PasswordResetToken();
            String raw = UUID.randomUUID() + hex(16);
            token.setUser(user);
            token.setTokenHash(sha256(raw));
            token.setExpiresAt(Instant.now().plusSeconds(1800));
            token.setUsed(false);
            resetTokens.save(token);
            // Email delivery is environment-specific; token is stored hashed only.
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken stored = resetTokens.findByTokenHash(sha256(token))
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired token"));
        if (stored.isUsed() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Invalid or expired token");
        }
        stored.setUsed(true);
        stored.getUser().setPasswordHash(encoder.encode(newPassword));
        refreshTokens.deleteByUserId(stored.getUser().getId());
    }

    public AuthDtos.UserSummary toSummary(UserAccount user) {
        UUID branchId = user.getBranch() == null ? null : user.getBranch().getId();
        String branchName = user.getBranch() == null ? null : user.getBranch().getName();
        return new AuthDtos.UserSummary(user.getId(), user.getEmail(), user.getUsername(), user.getFullName(),
                user.getRole().name(), branchId, branchName);
    }

    private AuthDtos.TokenResponse issue(UserAccount user) {
        UUID branchId = user.getBranch() == null ? null : user.getBranch().getId();
        Instant accessExp = Instant.now().plusSeconds(properties.getJwt().getAccessMinutes() * 60);
        String access = jwtService.createAccessToken(user.getId(), user.getEmail(), user.getRole(), branchId);
        String refreshRaw = UUID.randomUUID() + hex(24);
        RefreshToken refresh = new RefreshToken();
        refresh.setUser(user);
        refresh.setTokenHash(sha256(refreshRaw));
        refresh.setExpiresAt(Instant.now().plusSeconds(properties.getJwt().getRefreshDays() * 86400));
        refresh.setRevoked(false);
        refreshTokens.save(refresh);
        return new AuthDtos.TokenResponse(access, refreshRaw, accessExp, toSummary(user));
    }

    private String hex(int bytes) {
        byte[] buf = new byte[bytes];
        random.nextBytes(buf);
        return HexFormat.of().formatHex(buf);
    }

    public static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable");
        }
    }
}
