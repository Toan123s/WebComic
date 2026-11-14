package com.comichub.dto.rating;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * score/review/updatedAt là đánh giá của người dùng hiện tại (null nếu chưa chấm).
 * ratingAvg/ratingCount là số liệu tổng hợp của toàn bộ truyện.
 */
public record RatingResponse(
        Long comicId,
        Integer score,
        String review,
        BigDecimal ratingAvg,
        Integer ratingCount,
        LocalDateTime updatedAt
) {
}