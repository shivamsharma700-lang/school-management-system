package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.StaffAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface StaffAttendanceRepository extends JpaRepository<StaffAttendance, UUID>, JpaSpecificationExecutor<StaffAttendance> {
}
