package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.PayrollEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PayrollEntryRepository extends JpaRepository<PayrollEntry, UUID> {
    List<PayrollEntry> findByBranchIdOrderByPayMonthDesc(UUID branchId);

    List<PayrollEntry> findAllByOrderByPayMonthDesc();
}
