package com.comichub.service;

import com.comichub.dto.chapter.ChapterCreateRequest;
import com.comichub.dto.chapter.ChapterResponse;
import com.comichub.dto.chapter.ChapterUpdateRequest;
import com.comichub.entity.Chapter;
import com.comichub.entity.ChapterPage;
import com.comichub.entity.Comic;
import com.comichub.entity.ModerationLog;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ChapterPageRepository;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.ModerationLogRepository;
import com.comichub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class ChapterService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChapterService.class);
    private static final String DRAFT = "DRAFT";
    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";
    private static final String PUBLISHED = "PUBLISHED";

    private final ChapterRepository chapterRepository;
    private final ChapterPageRepository chapterPageRepository;
    private final ComicRepository comicRepository;
    private final UserRepository userRepository;
    private final ModerationLogRepository moderationLogRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public ChapterService(
            ChapterRepository chapterRepository,
            ChapterPageRepository chapterPageRepository,
            ComicRepository comicRepository,
            UserRepository userRepository,
            ModerationLogRepository moderationLogRepository,
            FileStorageService fileStorageService,
            NotificationService notificationService) {
        this.chapterRepository = chapterRepository;
        this.chapterPageRepository = chapterPageRepository;
        this.comicRepository = comicRepository;
        this.userRepository = userRepository;
        this.moderationLogRepository = moderationLogRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    public List<ChapterResponse> getChapters(Long comicId) {
        validateId(comicId, "ID truyện");
        Comic comic = findComic(comicId);
        List<Chapter> chapters = chapterRepository
                .findByComic_IdAndIsDeletedFalseOrderByChapterNumberAsc(comicId);

        if (isPublicComic(comic)) {
            if (canManage(comic, currentAuthentication())) {
                return chapters.stream().map(this::toResponse).toList();
            }
            return chapters.stream()
                    .filter(chapter -> PUBLISHED.equals(chapter.getStatus()))
                    .map(this::toResponse)
                    .toList();
        }

        if (!canManage(comic, currentAuthentication())) {
            throw new ResourceNotFoundException("Không tìm thấy truyện");
        }
        return chapters.stream().map(this::toResponse).toList();
    }

    public ChapterResponse getChapter(Long chapterId) {
        return toResponse(getAccessibleChapter(chapterId));
    }

    @Transactional
    public ChapterResponse createChapter(Long comicId, ChapterCreateRequest request) {
        validateId(comicId, "ID truyện");
        requireRole("AUTHOR");
        Comic comic = findComic(comicId);
        validateOwner(comic);

        if (chapterRepository.existsByComic_IdAndChapterNumber(
                comicId, request.chapterNumber())) {
            throw new DuplicateResourceException("Số chapter đã được sử dụng trong truyện này");
        }

        Chapter chapter = new Chapter();
        chapter.setComic(comic);
        chapter.setChapterNumber(request.chapterNumber());
        chapter.setTitle(normalizeTitle(request.title()));
        chapter.setStatus(DRAFT);
        chapter.setPageCount(0);
        chapter.setViewCount(0L);
        chapter.setIsDeleted(false);
        return toResponse(chapterRepository.save(chapter));
    }

    @Transactional
    public ChapterResponse updateChapter(Long chapterId, ChapterUpdateRequest request) {
        validateHasChanges(request);
        Chapter chapter = getEditableChapter(chapterId);
        if (request.chapterNumber() != null) {
            if (chapterRepository.existsByComic_IdAndChapterNumberAndIdNot(
                    chapter.getComic().getId(), request.chapterNumber(), chapterId)) {
                throw new DuplicateResourceException(
                        "Số chapter đã được sử dụng trong truyện này");
            }
            chapter.setChapterNumber(request.chapterNumber());
        }
        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new IllegalArgumentException("Tiêu đề chapter không được để trống");
            }
            chapter.setTitle(request.title().trim());
        }
        chapter.setRejectReason(null);
        return toResponse(chapterRepository.save(chapter));
    }

    @Transactional
    public ChapterResponse submitForReview(Long chapterId) {
        Chapter chapter = getEditableChapter(chapterId);
        if (!isPublicComic(chapter.getComic())) {
            throw new DuplicateResourceException(
                    "Chỉ có thể gửi chapter duyệt sau khi truyện đã được xuất bản");
        }
        int pageCount = chapterPageRepository.countByChapter_Id(chapterId);
        if (pageCount == 0) {
            throw new IllegalArgumentException(
                    "Chapter phải có ít nhất một trang trước khi gửi duyệt");
        }

        chapter.setPageCount(pageCount);
        chapter.setStatus(PENDING);
        chapter.setRejectReason(null);
        chapter.setReviewer(null);
        chapter.setReviewedAt(null);
        return toResponse(chapterRepository.save(chapter));
    }

    public List<ChapterResponse> getPendingChapters() {
        requireModeratorOrAdmin();
        return chapterRepository.findByStatusAndIsDeletedFalseOrderByCreatedAtAsc(PENDING)
                .stream()
                .filter(chapter -> isPublicComic(chapter.getComic()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ChapterResponse approveChapter(Long chapterId) {
        requireModeratorOrAdmin();
        Chapter chapter = findChapter(chapterId);
        requirePending(chapter);
        User moderator = getCurrentUser();
        rejectSelfModeration(chapter, moderator);
        if (!isPublicComic(chapter.getComic())) {
            throw new DuplicateResourceException(
                    "Không thể xuất bản chapter của truyện chưa được duyệt");
        }
        int pageCount = chapterPageRepository.countByChapter_Id(chapterId);
        if (pageCount == 0) {
            throw new DuplicateResourceException(
                    "Chapter không còn trang để xuất bản");
        }

        LocalDateTime now = LocalDateTime.now();
        chapter.setStatus(APPROVED);
        chapter.setPageCount(pageCount);
        chapter.setReviewer(moderator);
        chapter.setReviewedAt(now);
        chapter.setRejectReason(null);
        chapterRepository.save(chapter);
        recordModeration(chapter, moderator, "APPROVE", null, now);
        return toResponse(chapter);
    }

    @Transactional
    public ChapterResponse publishChapter(Long chapterId) {
        requireRole("ADMIN");
        Chapter chapter = findChapter(chapterId);
        if (!APPROVED.equals(chapter.getStatus())) {
            throw new DuplicateResourceException(
                    "Chỉ có thể xuất bản chapter đã được kiểm duyệt");
        }
        if (!isPublicComic(chapter.getComic())) {
            throw new DuplicateResourceException(
                    "Không thể xuất bản chapter của truyện chưa được duyệt");
        }
        int pageCount = chapterPageRepository.countByChapter_Id(chapterId);
        if (pageCount == 0) {
            throw new DuplicateResourceException(
                    "Chapter không còn trang để xuất bản");
        }

        chapter.setStatus(PUBLISHED);
        chapter.setPageCount(pageCount);
        LocalDateTime now = LocalDateTime.now();
        chapter.setPublishedAt(now);
        Chapter savedChapter = chapterRepository.save(chapter);
        recordModeration(savedChapter, getCurrentUser(), "PUBLISH", null, now);
        notificationService.createForPublishedChapter(savedChapter);
        return toResponse(savedChapter);
    }

    @Transactional
    public ChapterResponse rejectChapter(Long chapterId, String note) {
        requireModeratorOrAdmin();
        validateRejectNote(note);
        Chapter chapter = findChapter(chapterId);
        requirePending(chapter);

        User moderator = getCurrentUser();
        rejectSelfModeration(chapter, moderator);
        LocalDateTime now = LocalDateTime.now();
        chapter.setStatus(REJECTED);
        chapter.setReviewer(moderator);
        chapter.setReviewedAt(now);
        chapter.setRejectReason(note.trim());
        chapterRepository.save(chapter);
        recordModeration(chapter, moderator, "REJECT", note.trim(), now);
        return toResponse(chapter);
    }

    @Transactional
    public void deleteChapter(Long chapterId) {
        Chapter chapter = findChapter(chapterId);
        requireOwnerOrAdmin(chapter.getComic());

        if (PUBLISHED.equals(chapter.getStatus())) {
            chapter.setIsDeleted(true);
            chapterRepository.save(chapter);
            return;
        }
        if (!DRAFT.equals(chapter.getStatus()) && !REJECTED.equals(chapter.getStatus())) {
            throw new DuplicateResourceException(
                    "Chapter đang chờ duyệt; hãy xử lý yêu cầu duyệt trước khi xóa");
        }

        List<ChapterPage> pages = chapterPageRepository
                .findByChapter_IdOrderByPageNumberAsc(chapterId);
        chapterRepository.delete(chapter);
        deleteFilesAfterCommit(pages);
    }

    Chapter getAccessibleChapter(Long chapterId) {
        Chapter chapter = findChapter(chapterId);
        if (isPublicChapter(chapter)) {
            return chapter;
        }
        if (canManage(chapter.getComic(), currentAuthentication())) {
            return chapter;
        }
        throw new ResourceNotFoundException("Không tìm thấy chapter");
    }

    public Chapter getEditableChapter(Long chapterId) {
        requireRole("AUTHOR");
        Chapter chapter = findChapter(chapterId);
        validateOwner(chapter.getComic());
        if (!DRAFT.equals(chapter.getStatus()) && !REJECTED.equals(chapter.getStatus())) {
            throw new DuplicateResourceException(
                    "Chỉ có thể sửa chapter ở trạng thái DRAFT hoặc REJECTED");
        }
        return chapter;
    }

    private Chapter findChapter(Long id) {
        validateId(id, "ID chapter");
        Chapter chapter = chapterRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chapter có ID: " + id));
        if (Boolean.TRUE.equals(chapter.getIsDeleted())
                || Boolean.TRUE.equals(chapter.getComic().getIsDeleted())) {
            throw new ResourceNotFoundException("Không tìm thấy chapter");
        }
        return chapter;
    }

    private Comic findComic(Long id) {
        Comic comic = comicRepository.findWithAuthorById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy truyện có ID: " + id));
        if (Boolean.TRUE.equals(comic.getIsDeleted())) {
            throw new ResourceNotFoundException("Không tìm thấy truyện");
        }
        return comic;
    }

    private void validateOwner(Comic comic) {
        User currentUser = getCurrentUser();
        if (!Objects.equals(comic.getAuthor().getId(), currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền quản lý truyện này");
        }
    }

    private void requireOwnerOrAdmin(Comic comic) {
        if (hasRole(currentAuthentication(), "ADMIN")) {
            return;
        }
        requireRole("AUTHOR");
        validateOwner(comic);
    }

    private boolean canManage(Comic comic, Authentication authentication) {
        if (hasRole(authentication, "MODERATOR") || hasRole(authentication, "ADMIN")) {
            return true;
        }
        if (!isAuthenticated(authentication)) {
            return false;
        }
        return userRepository.findByUsername(authentication.getName())
                .map(user -> Objects.equals(comic.getAuthor().getId(), user.getId()))
                .orElse(false);
    }

    private boolean isPublicComic(Comic comic) {
        return PUBLISHED.equals(comic.getModerationStatus())
                && !Boolean.TRUE.equals(comic.getIsDeleted());
    }

    private boolean isPublicChapter(Chapter chapter) {
        return PUBLISHED.equals(chapter.getStatus()) && isPublicComic(chapter.getComic());
    }

    private void requirePending(Chapter chapter) {
        if (!PENDING.equals(chapter.getStatus())) {
            throw new DuplicateResourceException(
                    "Chapter không ở trạng thái chờ kiểm duyệt");
        }
    }

    private void recordModeration(
            Chapter chapter, User moderator, String action, String note, LocalDateTime now) {
        ModerationLog log = new ModerationLog();
        log.setComic(chapter.getComic());
        log.setChapter(chapter);
        log.setModerator(moderator);
        log.setAction(action);
        log.setNote(note);
        log.setCreatedAt(now);
        moderationLogRepository.save(log);
    }

    private void deleteFilesAfterCommit(List<ChapterPage> pages) {
        List<String> paths = pages.stream().map(ChapterPage::getImageUrl).toList();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED) {
                    paths.forEach(ChapterService.this::deleteFileAndLogFailure);
                }
            }
        });
    }

    private void deleteFileAndLogFailure(String path) {
        try {
            fileStorageService.delete(path);
        } catch (RuntimeException exception) {
            LOGGER.error("Không thể dọn tệp chapter sau khi xóa metadata: {}", path, exception);
        }
    }

    private User getCurrentUser() {
        Authentication authentication = currentAuthentication();
        if (!isAuthenticated(authentication)) {
            throw new AccessDeniedException("Bạn chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản: " + authentication.getName()));
    }

    private void requireRole(String role) {
        if (!hasRole(currentAuthentication(), role)) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện thao tác này");
        }
    }

    private void requireModeratorOrAdmin() {
        Authentication authentication = currentAuthentication();
        if (!hasRole(authentication, "MODERATOR") && !hasRole(authentication, "ADMIN")) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện thao tác này");
        }
    }

    private void rejectSelfModeration(Chapter chapter, User moderator) {
        if (Objects.equals(chapter.getComic().getAuthor().getId(), moderator.getId())) {
            throw new AccessDeniedException("Không thể tự kiểm duyệt chapter của mình");
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> Objects.equals(
                        authority.getAuthority(), "ROLE_" + role));
    }

    private boolean isAuthenticated(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }

    private Authentication currentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private ChapterResponse toResponse(Chapter chapter) {
        return new ChapterResponse(
                chapter.getId(),
                chapter.getComic().getId(),
                chapter.getChapterNumber(),
                chapter.getTitle(),
                chapter.getStatus(),
                chapter.getRejectReason(),
                chapter.getPageCount(),
                chapter.getViewCount(),
                chapter.getPublishedAt(),
                chapter.getCreatedAt());
    }

    private String normalizeTitle(String title) {
        return title == null || title.isBlank() ? null : title.trim();
    }

    private void validateHasChanges(ChapterUpdateRequest request) {
        if (request.chapterNumber() == null && request.title() == null) {
            throw new IllegalArgumentException(
                    "Cần cung cấp số chapter hoặc tiêu đề để cập nhật");
        }
    }

    private void validateRejectNote(String note) {
        if (note == null || note.isBlank()) {
            throw new IllegalArgumentException("MODERATOR phải ghi lý do từ chối");
        }
        if (note.length() > 500) {
            throw new IllegalArgumentException("Lý do từ chối tối đa 500 ký tự");
        }
    }

    private void validateId(Long id, String label) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(label + " phải là số nguyên dương");
        }
    }
}

