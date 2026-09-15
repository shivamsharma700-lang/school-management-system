package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface ReceiptRepository extends JpaRepository<Receipt, UUID>, JpaSpecificationExecutor<Receipt> {
    List<Receipt> findByPaymentStudentIdOrderByIssuedAtDesc(UUID studentId);

    List<Receipt> findByPaymentBranchIdOrderByIssuedAtDesc(UUID branchId);

    List<Receipt> findAllByOrderByIssuedAtDesc();
}
