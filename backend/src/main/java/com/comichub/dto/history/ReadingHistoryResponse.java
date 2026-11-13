package com.comichub.dto.history;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReadingHistoryResponse(
        Long id,
        Long comicId,
        String comicTitle,
        String comicSlug,
        String comicCoverUrl,
        Long chapterId,
        BigDecimal chapterNumber,
        String chapterTitle,
        Integer lastPageNumber,
        Integer pageCount,
        LocalDateTime readAt
) {
}
