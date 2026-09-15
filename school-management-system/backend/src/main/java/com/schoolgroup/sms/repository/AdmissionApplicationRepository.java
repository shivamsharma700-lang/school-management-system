package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.AdmissionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface AdmissionApplicationRepository extends JpaRepository<AdmissionApplication, UUID>, JpaSpecificationExecutor<AdmissionApplication> {
    boolean existsByBranchIdAndApplicationNumber(UUID branchId, String applicationNumber);
}
