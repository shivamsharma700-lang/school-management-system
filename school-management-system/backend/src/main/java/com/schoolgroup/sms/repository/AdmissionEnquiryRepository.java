package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.AdmissionEnquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface AdmissionEnquiryRepository extends JpaRepository<AdmissionEnquiry, UUID>, JpaSpecificationExecutor<AdmissionEnquiry> {
}
