package com.comichub.dto.notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String type,
        Long chapterId,
        String chapterTitle,
        Long comicId,
        String comicTitle,
        LocalDateTime createdAt,
        LocalDateTime readAt
) {
}
