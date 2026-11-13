package com.comichub.dto.chapter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ChapterResponse(
        Long id,
        Long comicId,
        BigDecimal chapterNumber,
        String title,
        String status,
        String rejectReason,
        Integer pageCount,
        Long viewCount,
        LocalDateTime publishedAt,
        LocalDateTime createdAt
) {
}

