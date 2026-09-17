package com.sms.backend.controller;

import com.sms.backend.model.Message;
import com.sms.backend.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.ok(messageService.sendMessage(message));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessage(@PathVariable String id) {
        return ResponseEntity.ok(messageService.getMessageById(id));
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(
            @RequestParam String user1,
            @RequestParam String user2) {
        return ResponseEntity.ok(messageService.getConversation(user1, user2));
    }

    @GetMapping("/received/{recipientId}")
    public ResponseEntity<List<Message>> getReceivedMessages(@PathVariable String recipientId) {
        return ResponseEntity.ok(messageService.getReceivedMessages(recipientId));
    }

    @GetMapping("/unread/{recipientId}")
    public ResponseEntity<List<Message>> getUnreadMessages(@PathVariable String recipientId) {
        return ResponseEntity.ok(messageService.getUnreadMessages(recipientId));
    }

    @GetMapping("/sent/{senderId}")
    public ResponseEntity<List<Message>> getSentMessages(@PathVariable String senderId) {
        return ResponseEntity.ok(messageService.getSentMessages(senderId));
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Message> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(messageService.markAsRead(id));
    }

    @GetMapping("/unread-count/{recipientId}")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String recipientId) {
        return ResponseEntity.ok(Map.of("unreadCount", messageService.getUnreadCount(recipientId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMessage(@PathVariable String id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok("Message deleted successfully");
    }
}
