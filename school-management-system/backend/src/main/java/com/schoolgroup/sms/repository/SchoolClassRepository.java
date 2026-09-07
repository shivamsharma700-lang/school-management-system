package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, UUID> {

    List<SchoolClass> findByBranchIdOrderByGradeLevelAsc(UUID branchId);

    boolean existsByBranchIdAndName(UUID branchId, String name);

    java.util.Optional<SchoolClass> findFirstByBranchIdAndGradeLevel(UUID branchId, Integer gradeLevel);
}
