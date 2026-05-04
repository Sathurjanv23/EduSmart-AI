package com.sms.backend.service;

import com.sms.backend.model.Announcement;
import com.sms.backend.model.Notification;
import com.sms.backend.repository.AnnouncementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnnouncementService {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private NotificationService notificationService;

    public Announcement addAnnouncement(Announcement announcement) {
        Announcement saved = announcementRepository.save(announcement);
        
        // Create a notification for everyone
        Notification notification = new Notification(
            "New Announcement",
            announcement.getTitle(),
            "info",
            null // global
        );
        notificationService.createNotification(notification);
        
        return saved;
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public void deleteAnnouncement(String id) {
        if (!announcementRepository.existsById(id)) {
            throw new RuntimeException("Announcement not found: " + id);
        }
        announcementRepository.deleteById(id);
    }
}