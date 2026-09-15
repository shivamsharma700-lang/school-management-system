package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface GuardianRepository extends JpaRepository<Guardian, UUID>, JpaSpecificationExecutor<Guardian> {

    Optional<Guardian> findByUserId(UUID userId);

    Optional<Guardian> findFirstByMobile(String mobile);
}
