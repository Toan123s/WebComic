package com.comichub.dto.chapter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ChapterRevisionResponse(
        Long id,
        Long chapterId,
        BigDecimal chapterNumber,
        String title,
        String status,
        String rejectReason,
        String submittedBy,
        LocalDateTime submittedAt,
        String reviewedBy,
        LocalDateTime reviewedAt,
        List<ChapterPageResponse> pages
) {
}
