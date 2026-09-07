package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface DriverRepository extends JpaRepository<Driver, UUID>, JpaSpecificationExecutor<Driver> {

    boolean existsByLicenseNumber(String licenseNumber);
}
