package com.schoolgroup.sms.controller;

import com.schoolgroup.sms.entity.Role;
import com.schoolgroup.sms.entity.SchoolEvent;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.SchoolEventRepository;
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

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

    public record EventRequest(
            UUID branchId,
            @NotBlank String title,
            @NotBlank String eventType,
            String audience,
            String location,
            @NotNull Instant startsAt,
            Instant endsAt,
            String description,
            String status
    ) {
    }

    private final AccessService access;
    private final SchoolEventRepository events;
    private final BranchRepository branches;
    private final AuditService audit;

    public EventController(AccessService access, SchoolEventRepository events, BranchRepository branches, AuditService audit) {
        this.access = access;
        this.events = events;
        this.branches = branches;
        this.audit = audit;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> list() {
        UUID branchId = access.current().getRole() == Role.SUPER_ADMIN ? null : access.requireBranch();
        List<SchoolEvent> rows = branchId == null ? events.findAllByOrderByStartsAtAsc() : events.findByBranchIdOrderByStartsAtAsc(branchId);
        return rows.stream().map(this::toRow).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public Map<String, Object> get(@PathVariable UUID id) {
        SchoolEvent e = events.findById(id).orElseThrow(() -> ApiException.notFound("Event not found"));
        access.assertBranch(e.getBranch().getId());
        return toRow(e);
    }

    @PostMapping
    @Transactional
    public Map<String, Object> create(@RequestBody EventRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        UUID branchId = access.resolveBranch(request.branchId());
        if (branchId == null) {
            throw ApiException.badRequest("branchId is required");
        }
        SchoolEvent e = new SchoolEvent();
        e.setBranch(branches.findById(branchId).orElseThrow(() -> ApiException.notFound("Branch not found")));
        apply(e, request);
        events.save(e);
        audit.record("CREATE", "EVENT", e.getId().toString(), e.getTitle());
        return toRow(e);
    }

    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> update(@PathVariable UUID id, @RequestBody EventRequest request) {
        access.assertRoles(Role.SUPER_ADMIN, Role.BRANCH_ADMIN, Role.PRINCIPAL);
        SchoolEvent e = events.findById(id).orElseThrow(() -> ApiException.notFound("Event not found"));
        access.assertBranch(e.getBranch().getId());
        apply(e, request);
        audit.record("UPDATE", "EVENT", id.toString(), e.getTitle());
        return toRow(e);
    }

    private void apply(SchoolEvent e, EventRequest request) {
        e.setTitle(request.title());
        e.setEventType(request.eventType());
        e.setAudience(request.audience() == null ? "ALL" : request.audience());
        e.setLocation(request.location());
        e.setStartsAt(request.startsAt());
        e.setEndsAt(request.endsAt());
        e.setDescription(request.description());
        if (request.status() != null) {
            e.setStatus(request.status());
        }
    }

    private Map<String, Object> toRow(SchoolEvent e) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", e.getId());
        row.put("branchId", e.getBranch().getId());
        row.put("branchName", e.getBranch().getName());
        row.put("title", e.getTitle());
        row.put("eventType", e.getEventType());
        row.put("audience", e.getAudience());
        row.put("location", e.getLocation() == null ? "" : e.getLocation());
        row.put("startsAt", e.getStartsAt().toString());
        row.put("endsAt", e.getEndsAt() == null ? "" : e.getEndsAt().toString());
        row.put("description", e.getDescription() == null ? "" : e.getDescription());
        row.put("status", e.getStatus());
        return row;
    }
}
