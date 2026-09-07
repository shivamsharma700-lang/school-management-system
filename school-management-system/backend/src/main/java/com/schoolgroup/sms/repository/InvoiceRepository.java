package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    List<Invoice> findByStudentIdOrderByIssueDateDesc(UUID studentId);

    long countByBranchIdAndStatus(UUID branchId, String status);

    long countByStatus(String status);

    @Query("select coalesce(sum(i.paidAmount), 0) from Invoice i")
    BigDecimal sumPaidAmount();

    @Query("select coalesce(sum(i.paidAmount), 0) from Invoice i where i.branch.id = :branchId")
    BigDecimal sumPaidAmountByBranchId(UUID branchId);

    @Query("select coalesce(sum(i.totalAmount), 0) from Invoice i")
    BigDecimal sumTotalAmount();

    @Query("select coalesce(sum(i.totalAmount), 0) from Invoice i where i.branch.id = :branchId")
    BigDecimal sumTotalAmountByBranchId(UUID branchId);

    List<Invoice> findTop8ByStatusInOrderByIssueDateDesc(Collection<String> statuses);

    @Query("select count(i) from Invoice i where i.status in ('PENDING', 'PARTIAL') and i.dueDate < :today")
    long countOverdue(@Param("today") LocalDate today);

    @Query("select count(i) from Invoice i where i.branch.id = :branchId and i.status in ('PENDING', 'PARTIAL') and i.dueDate < :today")
    long countOverdueByBranch(@Param("branchId") UUID branchId, @Param("today") LocalDate today);
}
