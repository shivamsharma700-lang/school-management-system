package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.entity.InventoryItem;
import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.InventoryItemRepository;
import com.schoolgroup.sms.service.AccessService;
import com.schoolgroup.sms.service.AuditService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    public record InventoryRequest(
            UUID branchId,
            @NotBlank String category,
            @NotBlank String itemName,
            String sku,
            String location,
            @NotNull Integer quantity,
            String unit,
            String status,
            String notes
    ) {
    }

    private final AccessService access;
    private final InventoryItemRepository items;
    private final BranchRepository branches;
    private final AuditService audit;

    public InventoryController(AccessService access, InventoryItemRepository items, BranchRepository branches, AuditService audit) {
        this.access = access;
        this.items = items;
        this.branches = branches;
        this.audit = audit;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> list() {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL, Role.ACCOUNTANT, Role.TEACHER);
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        List<InventoryItem> rows = branchId == null ? items.findAllByOrderByItemNameAsc() : items.findByBranchIdOrderByItemNameAsc(branchId);
        return rows.stream().map(this::toRow).toList();
    }

    @PostMapping
    @Transactional
    public Map<String, Object> create(@RequestBody InventoryRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.resolveBranch(request.branchId());
        if (branchId == null) {
            throw ApiException.badRequest("branchId is required");
        }
        InventoryItem item = new InventoryItem();
        item.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        apply(item, request);
        items.save(item);
        audit.record("CREATE", "INVENTORY", item.getId().toString(), item.getItemName());
        return toRow(item);
    }

    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> update(@PathVariable UUID id, @RequestBody InventoryRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        InventoryItem item = items.findById(id).orElseThrow(() -> ApiException.notFound("Inventory item not found"));
        access.assertBranch(item.getBranch().getId());
        apply(item, request);
        audit.record("UPDATE", "INVENTORY", id.toString(), item.getItemName());
        return toRow(item);
    }

    private void apply(InventoryItem item, InventoryRequest request) {
        item.setCategory(request.category());
        item.setItemName(request.itemName());
        item.setSku(request.sku());
        item.setLocation(request.location());
        item.setQuantity(request.quantity() == null ? 0 : Math.max(0, request.quantity()));
        item.setUnit(request.unit() == null || request.unit().isBlank() ? "PCS" : request.unit());
        if (request.status() != null && !request.status().isBlank()) {
            item.setStatus(request.status());
        } else if (item.getQuantity() != null && item.getQuantity() <= 0) {
            item.setStatus("OUT_OF_STOCK");
        } else if (item.getStatus() == null) {
            item.setStatus("IN_STOCK");
        }
        item.setNotes(request.notes());
    }

    private Map<String, Object> toRow(InventoryItem item) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", item.getId());
        row.put("branchId", item.getBranch().getId());
        row.put("branchName", item.getBranch().getName());
        row.put("category", item.getCategory());
        row.put("itemName", item.getItemName());
        row.put("sku", item.getSku() == null ? "" : item.getSku());
        row.put("location", item.getLocation() == null ? "" : item.getLocation());
        row.put("quantity", item.getQuantity());
        row.put("unit", item.getUnit());
        row.put("status", item.getStatus());
        row.put("notes", item.getNotes() == null ? "" : item.getNotes());
        return row;
    }
}
