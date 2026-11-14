package com.comichub.dto.follow;

import java.time.LocalDateTime;

public record FollowResponse(
        Long id,
        String targetType,
        Long targetId,
        String targetName,
        String targetImageUrl,
        Boolean notifyEnabled,
        LocalDateTime createdAt
) {
}
