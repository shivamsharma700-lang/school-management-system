package com.schoolgroup.sms.security;

import com.schoolgroup.sms.config.AppProperties;
import com.schoolgroup.sms.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final AppProperties properties;

    public JwtService(AppProperties properties) {
        this.properties = properties;
    }

    public String createAccessToken(UUID userId, String email, Role role, UUID branchId) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(properties.getJwt().getAccessMinutes() * 60);
        var builder = Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp));
        if (branchId != null) {
            builder.claim("branchId", branchId.toString());
        }
        return builder.signWith(key()).compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey key() {
        byte[] bytes = properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes");
        }
        return Keys.hmacShaKeyFor(bytes);
    }
}
