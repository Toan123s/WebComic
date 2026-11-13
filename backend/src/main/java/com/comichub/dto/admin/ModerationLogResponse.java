package com.comichub.dto.admin;

import java.time.LocalDateTime;

public record ModerationLogResponse(
        Long id,
        Long comicId,
        String comicTitle,
        Long chapterId,
        String chapterTitle,
        Long moderatorId,
        String moderatorUsername,
        String action,
        String note,
        LocalDateTime createdAt
) {
}
