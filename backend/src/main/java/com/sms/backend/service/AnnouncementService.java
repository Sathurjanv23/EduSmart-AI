package com.sms.backend.service;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.sms.backend.dto.AnnouncementDTO;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.Announcement;
import com.sms.backend.model.UserRole;
import com.sms.backend.repository.AnnouncementRepository;
import com.sms.backend.security.AcademicAccessService;
import com.sms.backend.security.UploadReferenceValidator;

@Service
public class AnnouncementService {
    private final AnnouncementRepository announcementRepository;
    private final AcademicAccessService accessService;

    public AnnouncementService(
            AnnouncementRepository announcementRepository,
            AcademicAccessService accessService) {
        this.announcementRepository = announcementRepository;
        this.accessService = accessService;
    }

    public Announcement addAnnouncement(AnnouncementDTO dto, String createdBy) {
        Announcement announcement = new Announcement();
        announcement.setTitle(dto.getTitle().trim());
        announcement.setContent(dto.getContent().trim());
        announcement.setVisibleTo(new LinkedHashSet<>(dto.getVisibleTo().stream().map(UserRole::from).toList())
                .stream().toList());
        announcement.setPriority(dto.getPriority() == null ? "NORMAL" : dto.getPriority());
        announcement.setCategory(normalize(dto.getCategory()));
        announcement.setAttachmentUrl(UploadReferenceValidator.normalizeOptional(dto.getAttachmentUrl()));
        LocalDateTime now = LocalDateTime.now();
        announcement.setPublishedAt(dto.getPublishedAt() == null ? now : dto.getPublishedAt());
        announcement.setExpiresAt(dto.getExpiresAt());
        announcement.setCreatedBy(createdBy);
        announcement.setCreatedAt(now);
        announcement.setUpdatedAt(now);
        return announcementRepository.save(announcement);
    }

    public List<Announcement> getVisibleAnnouncements(Authentication authentication) {
        if (accessService.hasAuthority(authentication, "ADMIN")) {
            return announcementRepository.findAll();
        }
        UserRole role = UserRole.from(authentication.getAuthorities().iterator().next().getAuthority());
        LocalDateTime now = LocalDateTime.now();
        return announcementRepository.findAll().stream()
                .filter(item -> item.getVisibleTo() != null && item.getVisibleTo().contains(role))
                .filter(item -> item.getPublishedAt() == null || !item.getPublishedAt().isAfter(now))
                .filter(item -> item.getExpiresAt() == null || item.getExpiresAt().isAfter(now))
                .toList();
    }

    public void deleteAnnouncement(String id, Authentication authentication) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Announcement"));
        if (!accessService.hasAuthority(authentication, "ADMIN")
                && !authentication.getName().equalsIgnoreCase(announcement.getCreatedBy())) {
            throw ApiException.forbidden("Teachers may only delete announcements they created");
        }
        announcementRepository.delete(announcement);
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
