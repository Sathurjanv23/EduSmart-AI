package com.sms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.model.Notification;
import com.sms.backend.security.IdentityAccessService;
import com.sms.backend.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final IdentityAccessService accessService;

    public NotificationController(NotificationService notificationService, IdentityAccessService accessService) {
        this.notificationService = notificationService;
        this.accessService = accessService;
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(
            @PathVariable String userId,
            Authentication authentication) {
        accessService.requireSelfOrAdmin(authentication, userId);
        return notificationService.getNotificationsForUser(userId);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id, Authentication authentication) {
        Notification notification = notificationService.requireById(id);
        if (notification.getUserId() != null) {
            accessService.requireSelfOrAdmin(authentication, notification.getUserId());
        }
        notificationService.markAsRead(notification, accessService.currentUserKey(authentication));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable String userId,
            Authentication authentication) {
        accessService.requireSelfOrAdmin(authentication, userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
