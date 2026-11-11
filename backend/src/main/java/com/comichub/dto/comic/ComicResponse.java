
package com.comichub.dto.comic;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DỰ ÁN: ComicHub
 * FILE: ComicResponse.java
 * PHỤ TRÁCH: TV1 - Backend
 * MỤC ĐÍCH: DTO trả về thông tin chi tiết truyện.
 * TRẠNG THÁI: ĐANG TRIỂN KHAI — cần đối chiếu frontend và kiểm thử.
 */
public record ComicResponse(
        Long id,
        Long authorId,
        String authorName,
        String title,
        String slug,
        String description,
        String coverUrl,
        String moderationStatus,
        String publicationStatus,
        String rejectReason,
        Long viewCount,
        BigDecimal ratingAvg,
        Integer ratingCount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
