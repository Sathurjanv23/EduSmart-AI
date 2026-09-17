package com.sms.backend.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
@CompoundIndex(name = "notification_user_created", def = "{'userId': 1, 'createdAt': -1}")
public class Notification {

    @Id
    private String id;
    private String title;
    private String message;
    private String type; // info, success, warning, error
    @Indexed
    private String userId; // Optional: null for global notifications
    private boolean read;
    @JsonIgnore
    private Set<String> readByUserIds = new HashSet<>();
    @Indexed
    private LocalDateTime createdAt;

    public Notification() {
        this.createdAt = LocalDateTime.now();
        this.read = false;
    }

    public Notification(String title, String message, String type, String userId) {
        this();
        this.title = title;
        this.message = message;
        this.type = type;
        this.userId = userId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Set<String> getReadByUserIds() { return readByUserIds; }
    public void setReadByUserIds(Set<String> readByUserIds) {
        this.readByUserIds = readByUserIds == null ? new HashSet<>() : readByUserIds;
    }
    public boolean isReadBy(String userId) {
        return readByUserIds != null && readByUserIds.contains(userId);
    }
    public void markReadBy(String userId) {
        if (readByUserIds == null) {
            readByUserIds = new HashSet<>();
        }
        readByUserIds.add(userId);
    }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
