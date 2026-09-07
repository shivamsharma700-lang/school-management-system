package com.schoolgroup.sms.repository;

import com.schoolgroup.sms.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    List<Payment> findByInvoiceId(UUID invoiceId);

    List<Payment> findByStudentIdOrderByCreatedAtDesc(UUID studentId);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.status = 'SUCCESS' and p.createdAt >= :from and p.createdAt < :to")
    BigDecimal sumSuccessBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.branch.id = :branchId and p.status = 'SUCCESS' and p.createdAt >= :from and p.createdAt < :to")
    BigDecimal sumSuccessBetweenByBranch(@Param("branchId") UUID branchId, @Param("from") Instant from, @Param("to") Instant to);
}
