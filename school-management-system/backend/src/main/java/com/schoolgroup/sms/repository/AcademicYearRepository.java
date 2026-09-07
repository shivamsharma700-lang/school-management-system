package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, UUID> {

    Optional<AcademicYear> findByName(String name);

    Optional<AcademicYear> findFirstByStatus(String status);
}
