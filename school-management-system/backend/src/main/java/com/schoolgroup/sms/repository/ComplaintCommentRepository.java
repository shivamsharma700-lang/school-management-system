package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.ComplaintComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ComplaintCommentRepository extends JpaRepository<ComplaintComment, UUID>, JpaSpecificationExecutor<ComplaintComment> {
}
