package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.StoredFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface StoredFileRepository extends JpaRepository<StoredFile, UUID>, JpaSpecificationExecutor<StoredFile> {
}
