package com.comichub.dto.follow;

import java.util.List;

public record FollowPageResponse(
        List<FollowResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
