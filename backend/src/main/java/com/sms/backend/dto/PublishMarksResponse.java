package com.sms.backend.dto;

import java.util.List;

/**
 * Response payload returned upon publishing academic marks.
 */
public record PublishMarksResponse(
        String classId,
        String subject,
        String examId,
        String assessmentId,
        int publishedCount,
        int alreadyPublishedCount,
        int totalTargeted,
        List<String> publishedIds,
        List<String> alreadyPublishedIds,
        String message
) {}
