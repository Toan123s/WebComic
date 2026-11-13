package com.comichub.dto.admin;

import java.util.List;

public record ModerationLogPageResponse(
        List<ModerationLogResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
