package com.schoolgroup.sms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * One auditable change to an invoice: a discount, a late fee, a refund or a
 * write-off. Invoice totals are recomputed from these rows, so the reason and
 * the person responsible are always recoverable.
 */
@Getter
@Setter
@Entity
@Table(name = "fee_adjustments")
public class FeeAdjustment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    /** DISCOUNT | LATE_FEE | REFUND | WRITE_OFF */
    @Column(name = "adjustment_type", nullable = false, length = 20)
    private String adjustmentType;

    /** Always positive; the type decides how it applies to the invoice. */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 400)
    private String reason;

    @Column(length = 80)
    private String reference;

    /** PENDING | APPLIED | REJECTED | REVERSED */
    @Column(nullable = false, length = 20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserAccount createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private UserAccount approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;
}
