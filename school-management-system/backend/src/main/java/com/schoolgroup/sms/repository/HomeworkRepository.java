package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface HomeworkRepository extends JpaRepository<Homework, UUID>, JpaSpecificationExecutor<Homework> {

    long countByBranchId(UUID branchId);

    java.util.List<Homework> findBySectionId(UUID sectionId);

    java.util.List<Homework> findByStaffId(UUID staffId);
}
