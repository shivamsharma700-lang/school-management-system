package com.schoolgroup.sms.service;

import com.schoolgroup.sms.entity.FeeAdjustment;
import com.schoolgroup.sms.entity.Invoice;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.FeeAdjustmentRepository;
import com.schoolgroup.sms.repository.InvoiceRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import com.schoolgroup.sms.security.PermissionMatrix.Action;
import com.schoolgroup.sms.security.PermissionMatrix.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Discounts, late fees, refunds and write-offs against an invoice.
 *
 * Invoice money columns are always recomputed from the stored adjustment rows so
 * the totals can be reconciled, and a refund needs a second pair of eyes: an
 * accountant raises it, an admin approves it.
 */
@Service
public class FeeAdjustmentService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final AccessService access;
    private final FeeAdjustmentRepository adjustments;
    private final InvoiceRepository invoices;
    private final UserAccountRepository users;
    private final AuditService audit;

    public FeeAdjustmentService(AccessService access,
                                FeeAdjustmentRepository adjustments,
                                InvoiceRepository invoices,
                                UserAccountRepository users,
                                AuditService audit) {
        this.access = access;
        this.adjustments = adjustments;
        this.invoices = invoices;
        this.users = users;
        this.audit = audit;
    }

    private Invoice requireInvoice(UUID invoiceId) {
        Invoice invoice = invoices.findById(invoiceId)
                .orElseThrow(() -> ApiException.notFound("Invoice not found"));
        access.assertBranch(invoice.getBranch() == null ? null : invoice.getBranch().getId());
        return invoice;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listForInvoice(UUID invoiceId) {
        access.assertCan(Resource.INVOICE, Action.VIEW);
        Invoice invoice = requireInvoice(invoiceId);
        // A parent or student may only read adjustments on their own invoice.
        access.requireStudentAccess(invoice.getStudent().getId());
        return adjustments.findByInvoiceId(invoiceId).stream()
                .sorted(Comparator.comparing(FeeAdjustment::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(FeeAdjustmentService::toRow)
                .toList();
    }

    @Transactional
    public Map<String, Object> addDiscount(UUID invoiceId, BigDecimal amount, String reason, String reference) {
        access.assertCan(Resource.DISCOUNT, Action.CREATE);
        return apply(invoiceId, "DISCOUNT", amount, reason, reference, "APPLIED");
    }

    @Transactional
    public Map<String, Object> addLateFee(UUID invoiceId, BigDecimal amount, String reason, String reference) {
        access.assertCan(Resource.INVOICE, Action.EDIT);
        return apply(invoiceId, "LATE_FEE", amount, reason, reference, "APPLIED");
    }

    @Transactional
    public Map<String, Object> addWriteOff(UUID invoiceId, BigDecimal amount, String reason, String reference) {
        // Writing off debt is an admin decision, not a cashier one.
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN);
        return apply(invoiceId, "WRITE_OFF", amount, reason, reference, "APPLIED");
    }

    /**
     * Refunds are raised as PENDING and do not move money until approved, so an
     * accountant cannot both create and release the same refund.
     */
    @Transactional
    public Map<String, Object> requestRefund(UUID invoiceId, BigDecimal amount, String reason, String reference) {
        access.assertCan(Resource.REFUND, Action.CREATE);
        Invoice invoice = requireInvoice(invoiceId);
        if (amount.compareTo(nz(invoice.getPaidAmount())) > 0) {
            throw ApiException.badRequest("Refund cannot exceed the amount already paid");
        }
        return apply(invoiceId, "REFUND", amount, reason, reference, "PENDING");
    }

    @Transactional
    public Map<String, Object> approveRefund(UUID adjustmentId, boolean approve, String note) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN);
        FeeAdjustment adj = adjustments.findById(adjustmentId)
                .orElseThrow(() -> ApiException.notFound("Adjustment not found"));
        access.assertBranch(adj.getBranch() == null ? null : adj.getBranch().getId());
        if (!"REFUND".equals(adj.getAdjustmentType())) {
            throw ApiException.badRequest("Only refunds require approval");
        }
        if (!"PENDING".equals(adj.getStatus())) {
            throw ApiException.badRequest("This refund has already been decided");
        }
        adj.setStatus(approve ? "APPLIED" : "REJECTED");
        adj.setApprovedBy(users.findById(access.current().getId()).orElse(null));
        adj.setApprovedAt(Instant.now());
        if (note != null && !note.isBlank()) {
            adj.setReason(adj.getReason() + " | " + note);
        }
        adjustments.save(adj);
        recalculate(adj.getInvoice());
        audit.record(approve ? "REFUND_APPROVED" : "REFUND_REJECTED", "fee_adjustment",
                adj.getId().toString(), "amount=" + adj.getAmount());
        return toRow(adj);
    }

    private Map<String, Object> apply(UUID invoiceId, String type, BigDecimal amount,
                                      String reason, String reference, String status) {
        if (amount == null || amount.signum() <= 0) {
            throw ApiException.badRequest("Amount must be greater than zero");
        }
        if (reason == null || reason.isBlank()) {
            throw ApiException.badRequest("A reason is required");
        }
        Invoice invoice = requireInvoice(invoiceId);

        if ("DISCOUNT".equals(type) || "WRITE_OFF".equals(type)) {
            BigDecimal reducible = nz(invoice.getBaseAmount())
                    .add(nz(invoice.getLateFeeAmount()))
                    .add(nz(invoice.getOtherAmount()))
                    .subtract(nz(invoice.getDiscountAmount()));
            if (amount.compareTo(reducible) > 0) {
                throw ApiException.badRequest("Amount exceeds the outstanding invoice value");
            }
        }

        FeeAdjustment adj = new FeeAdjustment();
        adj.setInvoice(invoice);
        adj.setStudent(invoice.getStudent());
        adj.setBranch(invoice.getBranch());
        adj.setAdjustmentType(type);
        adj.setAmount(amount);
        adj.setReason(reason.trim());
        adj.setReference(reference);
        adj.setStatus(status);
        adj.setCreatedBy(users.findById(access.current().getId()).orElse(null));
        adjustments.save(adj);

        recalculate(invoice);
        audit.record("FEE_" + type, "invoice", invoice.getId().toString(),
                "amount=" + amount + "; status=" + status);
        return toRow(adj);
    }

    /** Rebuilds the invoice money columns from every APPLIED adjustment. */
    private void recalculate(Invoice invoice) {
        List<FeeAdjustment> rows = adjustments.findByInvoiceId(invoice.getId());
        BigDecimal discount = ZERO;
        BigDecimal lateFee = ZERO;
        for (FeeAdjustment a : rows) {
            if (!"APPLIED".equals(a.getStatus())) {
                continue;
            }
            switch (a.getAdjustmentType()) {
                case "DISCOUNT", "WRITE_OFF" -> discount = discount.add(a.getAmount());
                case "LATE_FEE" -> lateFee = lateFee.add(a.getAmount());
                default -> {
                    // REFUND affects paid_amount, handled below.
                }
            }
        }
        BigDecimal refunded = rows.stream()
                .filter(a -> "REFUND".equals(a.getAdjustmentType()) && "APPLIED".equals(a.getStatus()))
                .map(FeeAdjustment::getAmount)
                .reduce(ZERO, BigDecimal::add);

        invoice.setDiscountAmount(discount);
        invoice.setLateFeeAmount(lateFee);
        BigDecimal total = nz(invoice.getBaseAmount())
                .add(lateFee)
                .add(nz(invoice.getOtherAmount()))
                .subtract(discount);
        if (total.signum() < 0) {
            total = ZERO;
        }
        invoice.setTotalAmount(total);

        BigDecimal netPaid = nz(invoice.getPaidAmount()).subtract(refunded);
        if (netPaid.signum() < 0) {
            netPaid = ZERO;
        }
        if (netPaid.compareTo(total) >= 0 && total.signum() > 0) {
            invoice.setStatus("PAID");
        } else if (netPaid.signum() > 0) {
            invoice.setStatus("PARTIAL");
        } else {
            invoice.setStatus("PENDING");
        }
        invoices.save(invoice);
    }

    private static BigDecimal nz(BigDecimal value) {
        return value == null ? ZERO : value;
    }

    private static Map<String, Object> toRow(FeeAdjustment a) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", a.getId());
        row.put("invoiceId", a.getInvoice() == null ? null : a.getInvoice().getId());
        row.put("studentId", a.getStudent() == null ? null : a.getStudent().getId());
        row.put("type", a.getAdjustmentType());
        row.put("amount", a.getAmount());
        row.put("reason", a.getReason());
        row.put("reference", a.getReference());
        row.put("status", a.getStatus());
        row.put("createdAt", a.getCreatedAt());
        return row;
    }
}
