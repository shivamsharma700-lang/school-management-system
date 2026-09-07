package com.schoolgroup.sms.service;

import com.schoolgroup.sms.config.AppProperties;
import com.schoolgroup.sms.dto.SchoolDtos;
import com.schoolgroup.sms.entity.FeeComponent;
import com.schoolgroup.sms.entity.FeeStructure;
import com.schoolgroup.sms.entity.Invoice;
import com.schoolgroup.sms.entity.Payment;
import com.schoolgroup.sms.entity.Receipt;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.Student;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.AcademicYearRepository;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.FeeComponentRepository;
import com.schoolgroup.sms.repository.FeeStructureRepository;
import com.schoolgroup.sms.repository.InvoiceRepository;
import com.schoolgroup.sms.repository.PaymentRepository;
import com.schoolgroup.sms.repository.ReceiptRepository;
import com.schoolgroup.sms.repository.SchoolClassRepository;
import com.schoolgroup.sms.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FeePaymentService {

    private final FeeStructureRepository structures;
    private final FeeComponentRepository components;
    private final InvoiceRepository invoices;
    private final PaymentRepository payments;
    private final ReceiptRepository receipts;
    private final StudentRepository students;
    private final BranchRepository branches;
    private final AcademicYearRepository years;
    private final SchoolClassRepository classes;
    private final AccessService access;
    private final AuditService audit;
    private final NotificationService notifications;
    private final AppProperties properties;

    public FeePaymentService(FeeStructureRepository structures, FeeComponentRepository components,
                             InvoiceRepository invoices, PaymentRepository payments, ReceiptRepository receipts,
                             StudentRepository students, BranchRepository branches, AcademicYearRepository years,
                             SchoolClassRepository classes, AccessService access, AuditService audit,
                             NotificationService notifications, AppProperties properties) {
        this.structures = structures;
        this.components = components;
        this.invoices = invoices;
        this.payments = payments;
        this.receipts = receipts;
        this.students = students;
        this.branches = branches;
        this.years = years;
        this.classes = classes;
        this.access = access;
        this.audit = audit;
        this.notifications = notifications;
        this.properties = properties;
    }

    @Transactional
    public FeeStructure createStructure(SchoolDtos.FeeStructureRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT);
        UUID branchId = access.resolveBranch(request.branchId());
        FeeStructure fs = new FeeStructure();
        fs.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        fs.setAcademicYear(years.findById(request.academicYearId()).orElseThrow(() -> ApiException.notFound("Academic year not found")));
        fs.setSchoolClass(classes.findById(request.classId()).orElseThrow(() -> ApiException.notFound("Class not found")));
        fs.setName(request.name());
        fs.setStatus("ACTIVE");
        structures.save(fs);
        audit.record("CREATE", "FEE_STRUCTURE", fs.getId().toString(), fs.getName());
        return fs;
    }

    @Transactional
    public FeeComponent addComponent(UUID structureId, SchoolDtos.FeeComponentRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT);
        FeeStructure fs = structures.findById(structureId).orElseThrow(() -> ApiException.notFound("Fee structure not found"));
        access.assertBranch(fs.getBranch().getId());
        FeeComponent c = new FeeComponent();
        c.setFeeStructure(fs);
        c.setName(request.name());
        c.setComponentType(request.componentType());
        c.setAmount(request.amount());
        components.save(c);
        return c;
    }

    public List<FeeStructure> listStructures(UUID branchId) {
        UUID resolved = access.resolveBranch(branchId);
        return structures.findAll().stream()
                .filter(s -> resolved == null || s.getBranch().getId().equals(resolved))
                .toList();
    }

    public BigDecimal calculateTotal(List<FeeComponent> comps, boolean applyLateFee) {
        BigDecimal base = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal late = BigDecimal.ZERO;
        BigDecimal other = BigDecimal.ZERO;
        for (FeeComponent c : comps) {
            switch (c.getComponentType()) {
                case "BASE" -> base = base.add(c.getAmount());
                case "DISCOUNT" -> discount = discount.add(c.getAmount());
                case "LATE_FEE" -> {
                    if (applyLateFee) {
                        late = late.add(c.getAmount());
                    }
                }
                default -> other = other.add(c.getAmount());
            }
        }
        BigDecimal total = base.subtract(discount).add(late).add(other);
        if (total.signum() < 0) {
            return BigDecimal.ZERO;
        }
        return total;
    }

    @Transactional
    public Invoice generateInvoice(UUID studentId, UUID feeStructureId, LocalDate dueDate) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT);
        Student student = access.requireStudentAccess(studentId);
        FeeStructure structure = structures.findById(feeStructureId).orElseThrow(() -> ApiException.notFound("Fee structure not found"));
        access.assertBranch(structure.getBranch().getId());
        List<FeeComponent> comps = components.findAll().stream()
                .filter(c -> c.getFeeStructure().getId().equals(feeStructureId))
                .toList();
        boolean late = LocalDate.now().isAfter(dueDate);
        BigDecimal base = sum(comps, "BASE");
        BigDecimal discount = sum(comps, "DISCOUNT");
        BigDecimal lateFee = late ? sum(comps, "LATE_FEE") : BigDecimal.ZERO;
        BigDecimal other = sum(comps, "OTHER");
        BigDecimal total = calculateTotal(comps, late);
        Invoice invoice = new Invoice();
        invoice.setStudent(student);
        invoice.setBranch(student.getBranch());
        invoice.setAcademicYear(student.getAcademicYear());
        invoice.setFeeStructure(structure);
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(dueDate);
        invoice.setBaseAmount(base);
        invoice.setDiscountAmount(discount);
        invoice.setLateFeeAmount(lateFee);
        invoice.setOtherAmount(other);
        invoice.setTotalAmount(total);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setStatus("PENDING");
        invoices.save(invoice);
        audit.record("CREATE", "INVOICE", invoice.getId().toString(), invoice.getInvoiceNumber());
        if (student.getUser() != null) {
            notifications.notifyUser(student.getUser(), student.getBranch(), "FEE_REMINDER",
                    "Fee invoice generated", "Invoice " + invoice.getInvoiceNumber() + " is pending.",
                    "INVOICE", invoice.getId());
        }
        return invoice;
    }

    @Transactional
    public Map<String, Object> createPaymentOrder(UUID invoiceId, String method, String idempotencyKey) {
        Invoice invoice = invoices.findById(invoiceId).orElseThrow(() -> ApiException.notFound("Invoice not found"));
        access.requireStudentAccess(invoice.getStudent().getId());
        if ("PAID".equals(invoice.getStatus()) || "CANCELLED".equals(invoice.getStatus())) {
            throw ApiException.conflict("Invoice is not payable");
        }
        String key = idempotencyKey == null || idempotencyKey.isBlank() ? UUID.randomUUID().toString() : idempotencyKey;
        var existing = payments.findByIdempotencyKey(key);
        if (existing.isPresent()) {
            Payment p = existing.get();
            return Map.of("paymentId", p.getId(), "orderId", p.getGatewayOrderId(), "amount", p.getAmount(),
                    "status", p.getStatus());
        }
        BigDecimal outstanding = invoice.getTotalAmount().subtract(invoice.getPaidAmount());
        if (outstanding.signum() <= 0) {
            throw ApiException.conflict("Nothing to pay");
        }
        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setStudent(invoice.getStudent());
        payment.setBranch(invoice.getBranch());
        payment.setAmount(outstanding);
        payment.setMethod(method);
        payment.setStatus("CREATED");
        payment.setIdempotencyKey(key);
        payment.setGatewayOrderId("ord_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20));
        payments.save(payment);
        audit.record("CREATE", "PAYMENT", payment.getId().toString(), payment.getGatewayOrderId());
        return Map.of(
                "paymentId", payment.getId(),
                "orderId", payment.getGatewayOrderId(),
                "amount", payment.getAmount(),
                "status", payment.getStatus(),
                "provider", properties.getPayment().getProvider()
        );
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        if (!verifySignature(payload, signature)) {
            throw ApiException.unauthorized("Invalid payment signature");
        }
        // payload format: orderId=...&status=SUCCESS&paymentId=...
        String orderId = extract(payload, "orderId");
        String status = extract(payload, "status");
        Payment payment = payments.findByGatewayOrderId(orderId)
                .orElseThrow(() -> ApiException.notFound("Payment order not found"));
        if ("SUCCESS".equals(payment.getStatus())) {
            return;
        }
        if (!"SUCCESS".equals(status)) {
            payment.setStatus("FAILED");
            payment.setFailureReason("Gateway reported failure");
            return;
        }
        markSuccess(payment, extract(payload, "paymentId"));
    }

    @Transactional
    public Receipt markOfflineSuccess(UUID paymentId) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.ACCOUNTANT);
        Payment payment = payments.findById(paymentId).orElseThrow(() -> ApiException.notFound("Payment not found"));
        access.assertBranch(payment.getBranch().getId());
        return markSuccess(payment, "offline-" + paymentId);
    }

    public boolean verifySignature(String payload, String signature) {
        if (payload == null || signature == null) {
            return false;
        }
        return hmac(payload).equalsIgnoreCase(signature);
    }

    public String hmac(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(properties.getPayment().getSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to sign payment payload");
        }
    }

    public List<Invoice> invoicesForStudent(UUID studentId) {
        access.requireStudentAccess(studentId);
        return invoices.findByStudentIdOrderByIssueDateDesc(studentId);
    }

    private Receipt markSuccess(Payment payment, String gatewayPaymentId) {
        Invoice invoice = payment.getInvoice();
        payment.setStatus("SUCCESS");
        payment.setGatewayPaymentId(gatewayPaymentId);
        invoice.setPaidAmount(invoice.getPaidAmount().add(payment.getAmount()));
        if (invoice.getPaidAmount().compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus("PAID");
        } else {
            invoice.setStatus("PARTIAL");
        }
        Receipt receipt = new Receipt();
        receipt.setPayment(payment);
        receipt.setReceiptNumber("RCPT-" + System.currentTimeMillis());
        receipt.setIssuedAt(Instant.now());
        receipts.save(receipt);
        if (invoice.getStudent().getUser() != null) {
            notifications.notifyUser(invoice.getStudent().getUser(), invoice.getBranch(), "PAYMENT_CONFIRMATION",
                    "Payment received", "Receipt " + receipt.getReceiptNumber() + " has been generated.",
                    "RECEIPT", receipt.getId());
        }
        audit.record("PAYMENT_SUCCESS", "PAYMENT", payment.getId().toString(), receipt.getReceiptNumber());
        return receipt;
    }

    private BigDecimal sum(List<FeeComponent> comps, String type) {
        return comps.stream()
                .filter(c -> type.equals(c.getComponentType()))
                .map(FeeComponent::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String extract(String payload, String key) {
        for (String part : payload.split("&")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2 && kv[0].equals(key)) {
                return kv[1];
            }
        }
        return "";
    }
}
