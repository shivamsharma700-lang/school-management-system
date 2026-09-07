package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.BookLoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface BookLoanRepository extends JpaRepository<BookLoan, UUID>, JpaSpecificationExecutor<BookLoan> {

    java.util.List<BookLoan> findByStudentId(UUID studentId);
}
