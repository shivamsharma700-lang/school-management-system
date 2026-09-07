package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.GuardianStudent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GuardianStudentRepository extends JpaRepository<GuardianStudent, UUID> {

    List<GuardianStudent> findByGuardianId(UUID guardianId);

    List<GuardianStudent> findByStudentId(UUID studentId);

    boolean existsByGuardianIdAndStudentId(UUID guardianId, UUID studentId);
}
