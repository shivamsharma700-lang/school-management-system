package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffRepository extends JpaRepository<Staff, UUID> {

    Optional<Staff> findByUserId(UUID userId);

    boolean existsByBranchIdAndEmployeeCode(UUID branchId, String employeeCode);

    List<Staff> findByBranchIdAndStaffType(UUID branchId, String staffType);

    List<Staff> findByBranchId(UUID branchId);

    long countByStaffType(String staffType);

    long countByBranchId(UUID branchId);

    long countByBranchIdAndStaffType(UUID branchId, String staffType);
}
