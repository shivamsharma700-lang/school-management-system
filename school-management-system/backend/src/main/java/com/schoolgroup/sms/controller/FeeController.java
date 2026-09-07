package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.entity.FeeStructure;
import com.schoolgroup.sms.entity.Invoice;
import com.schoolgroup.sms.service.FeePaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FeeController {

    private final FeePaymentService fees;

    public FeeController(FeePaymentService fees) {
        this.fees = fees;
    }

    @GetMapping("/fee-structures")
    public List<Map<String, Object>> structures(@RequestParam(required = false) UUID branchId) {
        return fees.listStructures(branchId).stream()
                .map(FeeController::toStructure)
                .toList();
    }

    @PostMapping("/fee-structures")
    public Map<String, Object> createStructure(@Valid @RequestBody SchoolDtos.FeeStructureRequest request) {
        return toStructure(fees.createStructure(request));
    }

    @PostMapping("/fee-structures/{id}/components")
    public Map<String, Object> component(@PathVariable UUID id, @Valid @RequestBody SchoolDtos.FeeComponentRequest request) {
        var c = fees.addComponent(id, request);
        return Map.of("id", c.getId(), "name", c.getName(), "type", c.getComponentType(), "amount", c.getAmount());
    }

    @PostMapping("/invoices")
    public Map<String, Object> invoice(@Valid @RequestBody SchoolDtos.InvoiceGenerateRequest request) {
        Invoice invoice = fees.generateInvoice(request.studentId(), request.feeStructureId(), request.dueDate());
        return toInvoice(invoice);
    }

    @GetMapping("/invoices")
    public List<Map<String, Object>> invoices(@RequestParam UUID studentId) {
        return fees.invoicesForStudent(studentId).stream().map(FeeController::toInvoice).toList();
    }

    @PostMapping("/payments/orders")
    public Map<String, Object> order(@Valid @RequestBody SchoolDtos.PaymentOrderRequest request,
                                     @RequestHeader(value = "X-Idempotency-Key", required = false) String headerKey) {
        String key = request.idempotencyKey() != null ? request.idempotencyKey() : headerKey;
        return fees.createPaymentOrder(request.invoiceId(), request.method(), key);
    }

    @PostMapping("/payments/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String payload,
                                        @RequestHeader(value = "X-Payment-Signature", required = false) String signature) {
        fees.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/payments/{id}/confirm-offline")
    public Map<String, Object> offline(@PathVariable UUID id) {
        var receipt = fees.markOfflineSuccess(id);
        return Map.of("receiptNumber", receipt.getReceiptNumber(), "issuedAt", receipt.getIssuedAt().toString());
    }

    private static Map<String, Object> toStructure(FeeStructure fs) {
        return Map.of(
                "id", fs.getId(),
                "name", fs.getName(),
                "branchId", fs.getBranch().getId(),
                "academicYearId", fs.getAcademicYear().getId(),
                "classId", fs.getSchoolClass().getId(),
                "status", fs.getStatus()
        );
    }

    private static Map<String, Object> toInvoice(Invoice invoice) {
        return Map.of(
                "id", invoice.getId(),
                "invoiceNumber", invoice.getInvoiceNumber(),
                "studentId", invoice.getStudent().getId(),
                "totalAmount", invoice.getTotalAmount(),
                "paidAmount", invoice.getPaidAmount(),
                "status", invoice.getStatus(),
                "dueDate", invoice.getDueDate().toString()
        );
    }
}
