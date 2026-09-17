package com.sms.backend.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "teacher_profiles")
public class TeacherProfile {
    @Id
    private String id;
    @Indexed(unique = true)
    private String userId;
    @Indexed(unique = true)
    private String email;
    private String name;
    @Indexed
    private List<String> assignedClassIds = new ArrayList<>();
    private List<String> assignedSubjects = new ArrayList<>();
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<String> getAssignedClassIds() { return assignedClassIds; }
    public void setAssignedClassIds(List<String> assignedClassIds) { this.assignedClassIds = assignedClassIds; }
    public List<String> getAssignedSubjects() { return assignedSubjects; }
    public void setAssignedSubjects(List<String> assignedSubjects) { this.assignedSubjects = assignedSubjects; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
