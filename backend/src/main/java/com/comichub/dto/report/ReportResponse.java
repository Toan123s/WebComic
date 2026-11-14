package com.comichub.dto.report;

import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        Long reporterId,
        String reporterUsername,
        String targetType,
        Long targetId,
        String reason,
        String description,
        String status,
        Long handledById,
        String handledByUsername,
        LocalDateTime handledAt,
        String resolutionNote,
        LocalDateTime createdAt
) {
}
