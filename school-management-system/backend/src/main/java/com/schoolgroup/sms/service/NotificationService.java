package com.schoolgroup.sms.service;

import com.schoolgroup.sms.entity.Branch;
import com.schoolgroup.sms.entity.Notification;
import com.schoolgroup.sms.entity.UserAccount;
import com.schoolgroup.sms.exception.ApiException;
import com.schoolgroup.sms.repository.NotificationRepository;
import com.schoolgroup.sms.security.AuthUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notifications;
    private final AccessService access;

    public NotificationService(NotificationRepository notifications, AccessService access) {
        this.notifications = notifications;
        this.access = access;
    }

    @Transactional
    public void notifyUser(UserAccount recipient, Branch branch, String type, String title, String body,
                           String entityType, UUID entityId) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setBranch(branch);
        n.setType(type);
        n.setTitle(title);
        n.setBody(body);
        n.setEntityType(entityType);
        n.setEntityId(entityId);
        notifications.save(n);
    }

    @Transactional(readOnly = true)
    public Page<Notification> myNotifications(int page, int size) {
        AuthUser user = access.current();
        return notifications.findByRecipientIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size));
    }

    @Transactional
    public void markRead(UUID id) {
        Notification n = notifications.findByIdAndRecipientId(id, access.current().getId())
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        n.setReadAt(Instant.now());
    }

    @Transactional
    public void markAllRead() {
        notifications.findByRecipientIdAndReadAtIsNull(access.current().getId())
                .forEach(n -> n.setReadAt(Instant.now()));
    }

    public long unreadCount() {
        return notifications.countByRecipientIdAndReadAtIsNull(access.current().getId());
    }
}
