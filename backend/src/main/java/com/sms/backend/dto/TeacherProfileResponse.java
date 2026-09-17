package com.sms.backend.dto;

import java.util.List;

import com.sms.backend.model.TeacherProfile;

public record TeacherProfileResponse(
        String id,
        String userId,
        String name,
        String email,
        List<String> assignedClassIds,
        List<String> assignedSubjects) {
    public static TeacherProfileResponse from(TeacherProfile profile) {
        return new TeacherProfileResponse(
                profile.getId(), profile.getUserId(), profile.getName(), profile.getEmail(),
                profile.getAssignedClassIds() == null ? List.of() : List.copyOf(profile.getAssignedClassIds()),
                profile.getAssignedSubjects() == null ? List.of() : List.copyOf(profile.getAssignedSubjects()));
    }
}
