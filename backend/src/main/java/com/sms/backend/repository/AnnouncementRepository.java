package com.sms.backend.repository;

import java.util.List;

import com.sms.backend.model.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
    List<Announcement> findByAttachmentUrl(String attachmentUrl);

    List<Announcement> findByAttachmentUrlContaining(String attachmentUrl);
}
