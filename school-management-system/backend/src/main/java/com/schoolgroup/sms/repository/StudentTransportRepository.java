package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.StudentTransport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface StudentTransportRepository extends JpaRepository<StudentTransport, UUID>, JpaSpecificationExecutor<StudentTransport> {

    boolean existsByStudentId(UUID studentId);

    java.util.List<StudentTransport> findByStudentId(UUID studentId);
}
