package com.sms.backend.service;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.sms.backend.dto.TeacherProfileRequest;
import com.sms.backend.dto.TeacherProfileResponse;
import com.sms.backend.exception.ApiException;
import com.sms.backend.model.TeacherProfile;
import com.sms.backend.model.User;
import com.sms.backend.model.UserRole;
import com.sms.backend.repository.TeacherProfileRepository;
import com.sms.backend.repository.UserRepository;

@Service
public class TeacherProfileService {
    private final TeacherProfileRepository profileRepository;
    private final UserRepository userRepository;

    public TeacherProfileService(TeacherProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public TeacherProfileResponse upsert(TeacherProfileRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.badRequest("MISSING_TEACHER_ACCOUNT", "Create the teacher user account first"));
        if (user.getRole() != UserRole.TEACHER) {
            throw ApiException.badRequest("INVALID_TEACHER_ACCOUNT", "The email does not belong to a teacher account");
        }

        TeacherProfile profile = profileRepository.findByEmail(email).orElseGet(TeacherProfile::new);
        profile.setUserId(user.getId());
        profile.setEmail(email);
        profile.setName(user.getName());
        profile.setAssignedClassIds(cleanValues(request.assignedClassIds()));
        profile.setAssignedSubjects(cleanValues(request.assignedSubjects()));
        profile.setUpdatedAt(Instant.now());
        return TeacherProfileResponse.from(profileRepository.save(profile));
    }

    public TeacherProfileResponse getCurrent(String email) {
        return TeacherProfileResponse.from(requireByEmail(email));
    }

    public TeacherProfile requireByEmail(String email) {
        return profileRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> ApiException.notFound("Teacher profile"));
    }

    private List<String> cleanValues(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return new LinkedHashSet<>(values.stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList()).stream().toList();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
