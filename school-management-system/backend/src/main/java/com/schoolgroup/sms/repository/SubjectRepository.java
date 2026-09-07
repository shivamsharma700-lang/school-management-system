package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface SubjectRepository extends JpaRepository<Subject, UUID>, JpaSpecificationExecutor<Subject> {

    Optional<Subject> findByBranchIdAndCode(UUID branchId, String code);

    java.util.List<Subject> findByBranchId(UUID branchId);
}
