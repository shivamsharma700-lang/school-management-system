package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.CampusRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CampusRecordRepository extends JpaRepository<CampusRecord, UUID> {
    List<CampusRecord> findByModuleTypeOrderByUpdatedAtDesc(String moduleType);

    List<CampusRecord> findByModuleTypeAndBranchIdOrderByUpdatedAtDesc(String moduleType, UUID branchId);

    List<CampusRecord> findByModuleTypeAndStudentIdOrderByUpdatedAtDesc(String moduleType, UUID studentId);
}
