package com.sms.backend.dto;

import java.time.Instant;

import com.sms.backend.model.Student;

public record StudentResponse(
        String id,
        String userId,
        String name,
        String email,
        String parentEmail,
        String studentClass,
        String gender,
        Instant createdAt,
        Instant updatedAt) {
    public static StudentResponse from(Student student) {
        return new StudentResponse(
                student.getId(), student.getUserId(), student.getName(), student.getEmail(),
                student.getParentEmail(), student.getStudentClass(), student.getGender(),
                student.getCreatedAt(), student.getUpdatedAt());
    }
}
