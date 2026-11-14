package com.comichub.dto.comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long comicId,
        Long chapterId,
        Long parentId,
        Long userId,
        String username,
        String content,
        String status,
        String moderationReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
