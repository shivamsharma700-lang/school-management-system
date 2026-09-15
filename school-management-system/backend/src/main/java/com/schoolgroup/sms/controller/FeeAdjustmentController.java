package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.service.FeeAdjustmentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Discounts, late fees, write-offs and refunds against an invoice. */
@RestController
@RequestMapping("/api/invoices")
public class FeeAdjustmentController {

    private final FeeAdjustmentService adjustments;

    public FeeAdjustmentController(FeeAdjustmentService adjustments) {
        this.adjustments = adjustments;
    }

    public record AdjustmentRequest(@NotNull BigDecimal amount, @NotBlank String reason, String reference) {
    }

    public record ApprovalRequest(boolean approve, String note) {
    }

    @GetMapping("/{invoiceId}/adjustments")
    public List<Map<String, Object>> list(@PathVariable UUID invoiceId) {
        return adjustments.listForInvoice(invoiceId);
    }

    @PostMapping("/{invoiceId}/discounts")
    public Map<String, Object> discount(@PathVariable UUID invoiceId,
                                        @Valid @RequestBody AdjustmentRequest request) {
        return adjustments.addDiscount(invoiceId, request.amount(), request.reason(), request.reference());
    }

    @PostMapping("/{invoiceId}/late-fees")
    public Map<String, Object> lateFee(@PathVariable UUID invoiceId,
                                       @Valid @RequestBody AdjustmentRequest request) {
        return adjustments.addLateFee(invoiceId, request.amount(), request.reason(), request.reference());
    }

    @PostMapping("/{invoiceId}/write-offs")
    public Map<String, Object> writeOff(@PathVariable UUID invoiceId,
                                        @Valid @RequestBody AdjustmentRequest request) {
        return adjustments.addWriteOff(invoiceId, request.amount(), request.reason(), request.reference());
    }

    @PostMapping("/{invoiceId}/refunds")
    public Map<String, Object> refund(@PathVariable UUID invoiceId,
                                      @Valid @RequestBody AdjustmentRequest request) {
        return adjustments.requestRefund(invoiceId, request.amount(), request.reason(), request.reference());
    }

    @PutMapping("/adjustments/{adjustmentId}/approval")
    public Map<String, Object> approve(@PathVariable UUID adjustmentId,
                                       @RequestBody ApprovalRequest request) {
        return adjustments.approveRefund(adjustmentId, request.approve(), request.note());
    }
}
