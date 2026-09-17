package com.sms.backend.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.sms.backend.model.Notification;
import com.sms.backend.repository.NotificationRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {
    @Mock
    private NotificationRepository repository;
    @InjectMocks
    private NotificationService service;

    @Test
    void globalReadStateIsScopedToTheRequestingUser() {
        Notification global = notification(null);
        global.markReadBy("user-1");
        when(repository.findByUserIdOrderByCreatedAtDesc("user-1")).thenReturn(List.of());
        when(repository.findByUserIdIsNullOrderByCreatedAtDesc()).thenReturn(List.of(global));

        assertTrue(service.getNotificationsForUser("user-1").get(0).isRead());

        when(repository.findByUserIdOrderByCreatedAtDesc("user-2")).thenReturn(List.of());
        assertFalse(service.getNotificationsForUser("user-2").get(0).isRead());
    }

    @Test
    void authenticatedReaderCanMarkGlobalNotificationWithoutAffectingOtherUsers() {
        Notification global = notification(null);

        service.markAsRead(global, "user-1");

        assertTrue(global.isReadBy("user-1"));
        assertFalse(global.isReadBy("user-2"));
        verify(repository).save(global);
    }

    private Notification notification(String userId) {
        Notification notification = new Notification("Title", "Message", "info", userId);
        notification.setCreatedAt(LocalDateTime.now());
        return notification;
    }
}
