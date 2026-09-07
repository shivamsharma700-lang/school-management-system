package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.HomeworkSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, UUID>, JpaSpecificationExecutor<HomeworkSubmission> {
}
