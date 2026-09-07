package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID>, JpaSpecificationExecutor<Exam> {

    boolean existsByBranchIdAndName(UUID branchId, String name);
}
