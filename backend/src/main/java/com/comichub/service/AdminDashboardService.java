package com.comichub.service;

import com.comichub.dto.admin.DashboardSummaryResponse;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ChapterRevisionRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.ComicRevisionRepository;
import com.comichub.repository.CommentRepository;
import com.comichub.repository.ReportRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final ComicRepository comicRepository;
    private final ComicRevisionRepository comicRevisionRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterRevisionRepository chapterRevisionRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;

    public AdminDashboardService(
            ComicRepository comicRepository,
            ComicRevisionRepository comicRevisionRepository,
            ChapterRepository chapterRepository,
            ChapterRevisionRepository chapterRevisionRepository,
            CommentRepository commentRepository,
            ReportRepository reportRepository) {
        this.comicRepository = comicRepository;
        this.comicRevisionRepository = comicRevisionRepository;
        this.chapterRepository = chapterRepository;
        this.chapterRevisionRepository = chapterRevisionRepository;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
    }

    public DashboardSummaryResponse getSummary() {
        requireAdmin();
        return new DashboardSummaryResponse(
                comicRepository.countByModerationStatusAndIsDeletedFalse("PENDING"),
                comicRevisionRepository.countByStatus("PENDING"),
                chapterRepository.countByStatusAndIsDeletedFalse("PENDING"),
                chapterRevisionRepository.countByStatus("PENDING"),
                commentRepository.countByStatus("PENDING"),
                reportRepository.countByStatus("OPEN"),
                reportRepository.countByStatus("IN_PROGRESS"));
    }

    private void requireAdmin() {
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!isAdmin) {
            throw new AccessDeniedException("Chỉ ADMIN mới được xem dashboard");
        }
    }
}
