package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookCopyRepository extends JpaRepository<BookCopy, UUID> {

    Optional<BookCopy> findByCopyCode(String copyCode);

    long countByBookIdAndStatus(UUID bookId, String status);
}
