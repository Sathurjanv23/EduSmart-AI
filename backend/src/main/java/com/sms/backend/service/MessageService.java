package com.sms.backend.service;

import com.sms.backend.model.Message;
import com.sms.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    public Message getMessageById(String id) {
        return messageRepository.findById(id).orElse(null);
    }

    public List<Message> getConversation(String user1, String user2) {
        return messageRepository.findBySenderIdAndRecipientId(user1, user2);
    }

    public List<Message> getReceivedMessages(String recipientId) {
        return messageRepository.findByRecipientId(recipientId);
    }

    public List<Message> getUnreadMessages(String recipientId) {
        return messageRepository.findByRecipientIdAndIsReadFalse(recipientId);
    }

    public List<Message> getSentMessages(String senderId) {
        return messageRepository.findBySenderId(senderId);
    }

    public Message markAsRead(String messageId) {
        Optional<Message> optional = messageRepository.findById(messageId);
        if (optional.isPresent()) {
            Message message = optional.get();
            message.setIsRead(true);
            return messageRepository.save(message);
        }
        return null;
    }

    public void deleteMessage(String id) {
        messageRepository.deleteById(id);
    }

    public Long getUnreadCount(String recipientId) {
        return messageRepository.findByRecipientIdAndIsReadFalse(recipientId).stream().count();
    }
}
