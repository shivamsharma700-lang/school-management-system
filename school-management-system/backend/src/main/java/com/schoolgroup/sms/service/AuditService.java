package com.schoolgroup.sms.service;

import com.schoolgroup.sms.entity.AuditLog;
import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.repository.AuditLogRepository;
import com.schoolgroup.sms.repository.BranchRepository;
import com.schoolgroup.sms.repository.UserAccountRepository;
import com.schoolgroup.sms.security.AuthUser;
import com.schoolgroup.sms.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository logs;
    private final UserAccountRepository users;
    private final BranchRepository branches;

    public AuditService(AuditLogRepository logs, UserAccountRepository users, BranchRepository branches) {
        this.logs = logs;
        this.users = users;
        this.branches = branches;
    }

    @Transactional
    public void record(String action, String entityType, String entityId, String metadata) {
        AuditLog log = new AuditLog();
        try {
            AuthUser current = SecurityUtils.currentUser();
            users.findById(current.getId()).ifPresent(log::setUser);
            log.setRole(current.getRole().name());
            if (current.getBranchId() != null) {
                Branch branch = branches.findById(current.getBranchId()).orElse(null);
                log.setBranch(branch);
            }
        } catch (Exception ignored) {
            // unauthenticated system action
        }
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setMetadata(metadata);
        logs.save(log);
    }
}
