package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.BookCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface BookCategoryRepository extends JpaRepository<BookCategory, UUID>, JpaSpecificationExecutor<BookCategory> {
    java.util.Optional<BookCategory> findFirstByBranchIdAndNameIgnoreCase(UUID branchId, String name);
}
