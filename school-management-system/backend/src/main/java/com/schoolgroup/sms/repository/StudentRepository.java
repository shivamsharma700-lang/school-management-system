package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID>, JpaSpecificationExecutor<Student> {

    boolean existsByBranchIdAndAdmissionNumber(UUID branchId, String admissionNumber);

    boolean existsByBranchIdAndStudentCode(UUID branchId, String studentCode);

    Optional<Student> findByUserId(UUID userId);

    Page<Student> findByBranchId(UUID branchId, Pageable pageable);

    List<Student> findBySectionIdAndStatus(UUID sectionId, String status);

    long countByBranchIdAndStatus(UUID branchId, String status);

    long countByBranchId(UUID branchId);

    List<Student> findAllByBranchId(UUID branchId);

    List<Student> findTop8ByOrderByAdmissionDateDesc();

    @Query("select c.name, c.gradeLevel, count(s) from Student s join s.schoolClass c group by c.name, c.gradeLevel order by c.gradeLevel")
    List<Object[]> countGroupedByClass();

    @Query("select b.name, count(s) from Student s join s.branch b group by b.name order by b.name")
    List<Object[]> countGroupedByBranch();
}
