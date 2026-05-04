package com.sms.backend.repository;

import com.sms.backend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findBySenderIdAndRecipientId(String senderId, String recipientId);

    List<Message> findByRecipientId(String recipientId);

    List<Message> findByRecipientIdAndIsReadFalse(String recipientId);

    List<Message> findBySenderId(String senderId);
}
