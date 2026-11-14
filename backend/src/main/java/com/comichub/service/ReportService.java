package com.comichub.service;

import com.comichub.dto.report.ReportCreateRequest;
import com.comichub.dto.report.ReportPageResponse;
import com.comichub.dto.report.ReportResponse;
import com.comichub.dto.report.ReportUpdateRequest;
import com.comichub.entity.Chapter;
import com.comichub.entity.Comment;
import com.comichub.entity.Comic;
import com.comichub.entity.Report;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.CommentRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.ReportRepository;
import com.comichub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private static final String OPEN = "OPEN";
    private static final String IN_PROGRESS = "IN_PROGRESS";
    private static final String RESOLVED = "RESOLVED";
    private static final String REJECTED = "REJECTED";
    private static final Set<String> TARGET_TYPES = Set.of("COMIC", "CHAPTER", "COMMENT");
    private static final Set<String> REASONS =
            Set.of("SPAM", "INAPPROPRIATE", "COPYRIGHT", "OTHER");

    private final ReportRepository reportRepository;
    private final ComicRepository comicRepository;
    private final ChapterRepository chapterRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public ReportService(
            ReportRepository reportRepository,
            ComicRepository comicRepository,
            ChapterRepository chapterRepository,
            CommentRepository commentRepository,
            UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.comicRepository = comicRepository;
        this.chapterRepository = chapterRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReportResponse createReport(ReportCreateRequest request) {
        requireReaderRole();
        User reporter = getCurrentUser();
        String targetType = normalize(request.targetType());
        String reason = normalize(request.reason());
        if (!TARGET_TYPES.contains(targetType)) {
            throw new IllegalArgumentException("targetType không hợp lệ");
        }
        if (!REASONS.contains(reason)) {
            throw new IllegalArgumentException("reason không hợp lệ");
        }
        validateTargetExists(targetType, request.targetId());

        Report report = new Report();
        report.setReporter(reporter);
        report.setTargetType(targetType);
        report.setTargetId(request.targetId());
        report.setReason(reason);
        report.setDescription(normalizeOptional(request.description()));
        report.setStatus(OPEN);
        report.setCreatedAt(LocalDateTime.now());
        return toResponse(reportRepository.save(report));
    }

    public ReportPageResponse getReports(
            String status, String targetType, int page, int size) {
        requireModeratorOrAdmin();
        validatePage(page, size);
        String normalizedStatus = normalizeOptional(status);
        String normalizedTargetType = normalizeOptional(targetType);
        if (normalizedStatus != null) {
            normalizedStatus = normalizedStatus.toUpperCase(Locale.ROOT);
            if (!Set.of(OPEN, IN_PROGRESS, RESOLVED, REJECTED).contains(normalizedStatus)) {
                throw new IllegalArgumentException("status không hợp lệ");
            }
        }
        if (normalizedTargetType != null) {
            normalizedTargetType = normalizedTargetType.toUpperCase(Locale.ROOT);
            if (!TARGET_TYPES.contains(normalizedTargetType)) {
                throw new IllegalArgumentException("targetType không hợp lệ");
            }
        }

        Page<Report> reports = reportRepository.search(
                normalizedStatus,
                normalizedTargetType,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return new ReportPageResponse(
                reports.getContent().stream().map(this::toResponse).toList(),
                reports.getNumber(),
                reports.getSize(),
                reports.getTotalElements(),
                reports.getTotalPages());
    }

    @Transactional
    public ReportResponse updateReport(Long reportId, ReportUpdateRequest request) {
        requireModeratorOrAdmin();
        User moderator = getCurrentUser();
        Report report = findReport(reportId);
        String nextStatus = request.status().trim().toUpperCase(Locale.ROOT);

        if (OPEN.equals(report.getStatus())) {
            if (!IN_PROGRESS.equals(nextStatus)) {
                throw new DuplicateResourceException(
                        "Report OPEN phải chuyển sang IN_PROGRESS trước khi kết luận");
            }
        } else if (IN_PROGRESS.equals(report.getStatus())) {
            if (!RESOLVED.equals(nextStatus) && !REJECTED.equals(nextStatus)) {
                throw new DuplicateResourceException(
                        "Report IN_PROGRESS chỉ có thể chuyển sang RESOLVED hoặc REJECTED");
            }
        } else {
            throw new DuplicateResourceException("Report đã được kết luận");
        }
        if (Objects.equals(report.getReporter().getId(), moderator.getId())) {
            throw new AccessDeniedException("Không thể xử lý report do chính mình gửi");
        }

        String note = normalizeOptional(request.resolutionNote());
        if ((RESOLVED.equals(nextStatus) || REJECTED.equals(nextStatus))
                && note == null) {
            throw new IllegalArgumentException(
                    "Cần ghi resolutionNote khi kết luận report");
        }

        report.setStatus(nextStatus);
        report.setHandledBy(moderator);
        report.setHandledAt(LocalDateTime.now());
        report.setResolutionNote(note);
        return toResponse(reportRepository.save(report));
    }

    private void validateTargetExists(String targetType, Long targetId) {
        validateId(targetId, "targetId");
        switch (targetType) {
            case "COMIC" -> findPublicComic(targetId);
            case "CHAPTER" -> findPublicChapter(targetId);
            case "COMMENT" -> {
                Comment comment = commentRepository.findWithDetailsById(targetId)
                        .filter(value -> "VISIBLE".equals(value.getStatus())
                                && isPublicComic(value.getComic())
                                && (value.getChapter() == null
                                || isPublicChapter(value.getChapter())))
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy nội dung để báo cáo"));
            }
            default -> throw new IllegalArgumentException("targetType không hợp lệ");
        }
    }

    private Comic findPublicComic(Long id) {
        return comicRepository.findWithAuthorById(id)
                .filter(this::isPublicComic)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy nội dung để báo cáo"));
    }

    private Chapter findPublicChapter(Long id) {
        return chapterRepository.findWithDetailsById(id)
                .filter(this::isPublicChapter)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy nội dung để báo cáo"));
    }

    private Report findReport(Long id) {
        validateId(id, "ID report");
        return reportRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy report"));
    }

    private ReportResponse toResponse(Report report) {
        return new ReportResponse(
                report.getId(),
                report.getReporter().getId(),
                report.getReporter().getUsername(),
                report.getTargetType(),
                report.getTargetId(),
                report.getReason(),
                report.getDescription(),
                report.getStatus(),
                report.getHandledBy() == null ? null : report.getHandledBy().getId(),
                report.getHandledBy() == null ? null : report.getHandledBy().getUsername(),
                report.getHandledAt(),
                report.getResolutionNote(),
                report.getCreatedAt());
    }

    private boolean isPublicComic(Comic comic) {
        return "PUBLISHED".equals(comic.getModerationStatus())
                && !Boolean.TRUE.equals(comic.getIsDeleted());
    }

    private boolean isPublicChapter(Chapter chapter) {
        return "PUBLISHED".equals(chapter.getStatus())
                && isPublicComic(chapter.getComic())
                && !Boolean.TRUE.equals(chapter.getIsDeleted());
    }

    private void requireReaderRole() {
        if (!hasRole("USER") && !hasRole("AUTHOR")) {
            throw new AccessDeniedException(
                    "Chỉ USER hoặc AUTHOR mới được gửi report");
        }
    }

    private void requireModeratorOrAdmin() {
        if (!hasRole("MODERATOR") && !hasRole("ADMIN")) {
            throw new AccessDeniedException(
                    "Bạn không có quyền quản lý report");
        }
    }

    private User getCurrentUser() {
        Authentication authentication = currentAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("Bạn chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản hiện tại"));
    }

    private boolean hasRole(String role) {
        Authentication authentication = currentAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> Objects.equals(
                        authority.getAuthority(), "ROLE_" + role));
    }

    private Authentication currentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private void validatePage(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("page không được nhỏ hơn 0");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size phải nằm trong khoảng 1 đến 100");
        }
    }

    private void validateId(Long id, String label) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(label + " phải là số nguyên dương");
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
