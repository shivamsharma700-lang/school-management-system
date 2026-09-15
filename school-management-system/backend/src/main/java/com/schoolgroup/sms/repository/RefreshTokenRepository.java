package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByUserId(UUID userId);

    @Modifying(clearAutomatically = true)
    @Query("update RefreshToken t set t.revoked = true where t.user.id = :userId and t.revoked = false")
    void revokeAllForUser(@Param("userId") UUID userId);

    void deleteByUserId(UUID userId);
}
