package com.sms.backend.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sms.backend.dto.AnnouncementDTO;
import com.sms.backend.model.Announcement;
import com.sms.backend.service.AnnouncementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {
    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @PostMapping
    public ResponseEntity<Announcement> addAnnouncement(
            @Valid @RequestBody AnnouncementDTO request,
            Authentication authentication) {
        Announcement saved = announcementService.addAnnouncement(request, authentication.getName());
        return ResponseEntity.created(URI.create("/api/announcements/" + saved.getId())).body(saved);
    }

    @GetMapping
    public List<Announcement> announcements(Authentication authentication) {
        return announcementService.getVisibleAnnouncements(authentication);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, Authentication authentication) {
        announcementService.deleteAnnouncement(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
