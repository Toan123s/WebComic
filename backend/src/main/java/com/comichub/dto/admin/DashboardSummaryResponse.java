package com.comichub.dto.admin;

public record DashboardSummaryResponse(
        long pendingComics,
        long pendingComicRevisions,
        long pendingChapters,
        long pendingChapterRevisions,
        long pendingComments,
        long openReports,
        long inProgressReports
) {
}
