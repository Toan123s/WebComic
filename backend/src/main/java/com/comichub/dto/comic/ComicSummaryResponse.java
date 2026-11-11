package com.comichub.dto.comic;

import java.math.BigDecimal;

/**
 * DỰ ÁN: ComicHub
 * FILE: ComicSummaryResponse.java
 * PHỤ TRÁCH: TV1 - Backend
 * MỤC ĐÍCH: DTO hiển thị thông tin tóm tắt truyện.
 * TRẠNG THÁI: ĐANG TRIỂN KHAI — cần đối chiếu frontend và kiểm thử.
 */
public record ComicSummaryResponse(
        Long id,
        String title,
        String slug,
        String coverUrl,
        String authorName,
        String publicationStatus,
        BigDecimal ratingAvg,
        Integer ratingCount,
        Long viewCount
) {
}