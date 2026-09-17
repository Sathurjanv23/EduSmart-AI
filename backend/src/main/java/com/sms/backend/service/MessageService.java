package com.sms.backend.service;

import com.sms.backend.model.Message;
import com.sms.backend.repository.MessageRepository;
import com.sms.backend.exception.ApiException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    public Message getMessageById(String id) {
        return requireById(id);
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
        Message message = requireById(messageId);
        message.setIsRead(true);
        return messageRepository.save(message);
    }

    public void deleteMessage(String id) {
        messageRepository.delete(requireById(id));
    }

    public Long getUnreadCount(String recipientId) {
        return messageRepository.findByRecipientIdAndIsReadFalse(recipientId).stream().count();
    }

    private Message requireById(String id) {
        return messageRepository.findById(id).orElseThrow(() -> ApiException.notFound("Message"));
    }
}
