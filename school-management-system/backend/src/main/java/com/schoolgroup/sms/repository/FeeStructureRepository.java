package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface FeeStructureRepository extends JpaRepository<FeeStructure, UUID>, JpaSpecificationExecutor<FeeStructure> {

    boolean existsByBranchIdAndName(UUID branchId, String name);
}
