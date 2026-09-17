package com.sms.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.sms.backend.model.Announcement;
import com.sms.backend.model.UserRole;
import com.sms.backend.repository.AnnouncementRepository;
import com.sms.backend.security.AcademicAccessService;

@ExtendWith(MockitoExtension.class)
class AnnouncementServiceTest {
    @Mock AnnouncementRepository repository;
    @Mock AcademicAccessService accessService;

    private AnnouncementService service;

    @BeforeEach
    void setUp() {
        service = new AnnouncementService(repository, accessService);
    }

    @Test
    void studentOnlySeesPublishedUnexpiredStudentAnnouncements() {
        Announcement visible = announcement(UserRole.STUDENT, LocalDateTime.now().minusMinutes(1), null);
        Announcement teacherOnly = announcement(UserRole.TEACHER, LocalDateTime.now().minusMinutes(1), null);
        Announcement expired = announcement(UserRole.STUDENT, LocalDateTime.now().minusDays(2), LocalDateTime.now().minusDays(1));
        var authentication = new UsernamePasswordAuthenticationToken(
                "student@example.test", null, List.of(new SimpleGrantedAuthority("STUDENT")));
        when(accessService.hasAuthority(authentication, "ADMIN")).thenReturn(false);
        when(repository.findAll()).thenReturn(List.of(visible, teacherOnly, expired));

        assertEquals(List.of(visible), service.getVisibleAnnouncements(authentication));
    }

    private Announcement announcement(UserRole audience, LocalDateTime publishedAt, LocalDateTime expiresAt) {
        Announcement announcement = new Announcement();
        announcement.setVisibleTo(List.of(audience));
        announcement.setPublishedAt(publishedAt);
        announcement.setExpiresAt(expiresAt);
        return announcement;
    }
}
