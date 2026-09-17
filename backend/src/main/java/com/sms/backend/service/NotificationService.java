package com.sms.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Notification;
import com.sms.backend.repository.NotificationRepository;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(String userId) {
        List<Notification> notifications = Stream.concat(
                    notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream(),
                    notificationRepository.findByUserIdIsNullOrderByCreatedAtDesc().stream())
                .sorted((first, second) -> second.getCreatedAt().compareTo(first.getCreatedAt()))
                .toList();
        notifications.stream()
                .filter(notification -> notification.getUserId() == null)
                .forEach(notification -> notification.setRead(notification.isReadBy(userId)));
        return notifications;
    }

    public Notification requireById(String id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Notification"));
    }

    public void markAsRead(Notification notification, String readerId) {
        if (notification.getUserId() == null) {
            notification.markReadBy(readerId);
            notification.setRead(true);
        } else {
            notification.setRead(true);
        }
        notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = new ArrayList<>(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
        notifications.forEach(notification -> notification.setRead(true));
        List<Notification> globalNotifications = notificationRepository.findByUserIdIsNullOrderByCreatedAtDesc();
        globalNotifications.forEach(notification -> notification.markReadBy(userId));
        notifications.addAll(globalNotifications);
        notificationRepository.saveAll(notifications);
    }
}
