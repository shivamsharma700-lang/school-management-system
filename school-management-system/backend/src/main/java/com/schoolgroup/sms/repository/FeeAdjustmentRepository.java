package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.FeeAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FeeAdjustmentRepository extends JpaRepository<FeeAdjustment, UUID> {

    List<FeeAdjustment> findByInvoiceId(UUID invoiceId);

    List<FeeAdjustment> findByStudentId(UUID studentId);

    List<FeeAdjustment> findByBranchIdAndAdjustmentType(UUID branchId, String adjustmentType);
}
