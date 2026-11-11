package com.comichub.dto.comic;

import java.time.LocalDateTime;

public record ComicRevisionResponse(
        Long id,
        Long comicId,
        String title,
        String description,
        String coverUrl,
        String publicationStatus,
        String status,
        String rejectReason,
        String submittedBy,
        LocalDateTime submittedAt,
        String reviewedBy,
        LocalDateTime reviewedAt
) {
}
