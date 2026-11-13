package com.comichub.service;

import com.comichub.dto.chapter.ChapterPageResponse;
import com.comichub.dto.chapter.ChapterRevisionCreateRequest;
import com.comichub.dto.chapter.ChapterRevisionResponse;
import com.comichub.dto.chapter.ChapterRevisionUpdateRequest;
import com.comichub.entity.Chapter;
import com.comichub.entity.ChapterPage;
import com.comichub.entity.ChapterRevision;
import com.comichub.entity.ChapterRevisionPage;
import com.comichub.entity.Comic;
import com.comichub.entity.ModerationLog;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ChapterPageRepository;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ChapterRevisionPageRepository;
import com.comichub.repository.ChapterRevisionRepository;
import com.comichub.repository.ModerationLogRepository;
import com.comichub.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class ChapterRevisionService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(ChapterRevisionService.class);
    private static final String DRAFT = "DRAFT";
    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";
    private static final String PUBLISHED = "PUBLISHED";
    private static final List<String> ACTIVE_STATUSES = List.of(DRAFT, PENDING);

    private final ChapterRevisionRepository revisionRepository;
    private final ChapterRevisionPageRepository revisionPageRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterPageRepository chapterPageRepository;
    private final UserRepository userRepository;
    private final ModerationLogRepository moderationLogRepository;
    private final FileStorageService fileStorageService;

    public ChapterRevisionService(
            ChapterRevisionRepository revisionRepository,
            ChapterRevisionPageRepository revisionPageRepository,
            ChapterRepository chapterRepository,
            ChapterPageRepository chapterPageRepository,
            UserRepository userRepository,
            ModerationLogRepository moderationLogRepository,
            FileStorageService fileStorageService) {
        this.revisionRepository = revisionRepository;
        this.revisionPageRepository = revisionPageRepository;
        this.chapterRepository = chapterRepository;
        this.chapterPageRepository = chapterPageRepository;
        this.userRepository = userRepository;
        this.moderationLogRepository = moderationLogRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ChapterRevisionResponse createDraft(
            Long chapterId, ChapterRevisionCreateRequest request) {
        Chapter chapter = getOwnedPublishedChapter(chapterId);
        if (revisionRepository.existsByChapter_IdAndStatusIn(chapterId, ACTIVE_STATUSES)) {
            throw new DuplicateResourceException(
                    "Chapter đã có một revision đang được chỉnh sửa hoặc chờ duyệt");
        }

        ChapterRevision revision = new ChapterRevision();
        revision.setChapter(chapter);
        revision.setSubmittedBy(currentUser());
        revision.setChapterNumber(request != null && request.chapterNumber() != null
                ? request.chapterNumber()
                : chapter.getChapterNumber());
        revision.setTitle(request != null && request.title() != null
                ? normalizeTitle(request.title())
                : chapter.getTitle());
        revision.setStatus(DRAFT);
        revision.setSubmittedAt(LocalDateTime.now());
        ChapterRevision saved = revisionRepository.saveAndFlush(revision);

        List<ChapterRevisionPage> pageSnapshots = chapterPageRepository
                .findByChapter_IdOrderByPageNumberAsc(chapterId)
                .stream()
                .map(page -> snapshotPage(saved, page))
                .toList();
        revisionPageRepository.saveAllAndFlush(pageSnapshots);
        return toResponse(saved, pageSnapshots);
    }

    public List<ChapterRevisionResponse> getChapterRevisions(Long chapterId) {
        Chapter chapter = findChapter(chapterId);
        requireOwnerOrModerator(chapter);
        return revisionRepository.findByChapter_IdOrderBySubmittedAtDesc(chapterId)
                .stream()
                .map(revision -> toResponse(
                        revision,
                        revisionPageRepository.findByRevision_IdOrderByPageNumberAsc(
                                revision.getId())))
                .toList();
    }

    @Transactional
    public ChapterRevisionResponse updateDraft(
            Long revisionId, ChapterRevisionUpdateRequest request) {
        ChapterRevision revision = requireOwnedDraft(revisionId);
        if (request == null || (request.chapterNumber() == null && request.title() == null)) {
            throw new IllegalArgumentException("Cần cung cấp trường cần cập nhật");
        }
        if (request.chapterNumber() != null) {
            revision.setChapterNumber(request.chapterNumber());
        }
        if (request.title() != null) {
            revision.setTitle(normalizeTitle(request.title()));
        }
        return toResponse(revisionRepository.save(revision),
                revisionPageRepository.findByRevision_IdOrderByPageNumberAsc(revisionId));
    }

    @Transactional
    public List<ChapterPageResponse> uploadPages(
            Long revisionId, List<MultipartFile> files) {
        ChapterRevision revision = requireOwnedDraft(revisionId);
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Chọn ít nhất một ảnh để tải lên");
        }

        List<ChapterRevisionPage> existing = revisionPageRepository
                .findByRevision_IdOrderByPageNumberAsc(revisionId);
        int nextPageNumber = existing.stream()
                .map(ChapterRevisionPage::getPageNumber)
                .max(Comparator.naturalOrder())
                .orElse(0) + 1;
        List<String> uploadedPaths = new ArrayList<>();
        deleteUploadsOnRollback(uploadedPaths);
        List<ChapterRevisionPage> newPages = new ArrayList<>();

        for (int index = 0; index < files.size(); index++) {
            var stored = fileStorageService.storeChapterPage(
                    files.get(index),
                    revision.getChapter().getComic().getId(),
                    revision.getChapter().getId());
            uploadedPaths.add(stored.relativePath());

            ChapterRevisionPage page = new ChapterRevisionPage();
            page.setRevision(revision);
            page.setPageNumber(nextPageNumber + index);
            page.setImageUrl(stored.relativePath());
            page.setWidth(stored.width());
            page.setHeight(stored.height());
            page.setFileSize(stored.fileSize());
            page.setUploadedForRevision(true);
            newPages.add(page);
        }
        return revisionPageRepository.saveAllAndFlush(newPages).stream()
                .map(this::toPageResponse)
                .toList();
    }

    public ImageFile getRevisionPageImage(Long pageId) {
        ChapterRevisionPage page = findRevisionPage(pageId);
        requireOwnerOrModerator(page.getRevision().getChapter());
        Path path = fileStorageService.resolveStoredFile(page.getImageUrl());
        return new ImageFile(path, fileStorageService.contentType(page.getImageUrl()));
    }

    @Transactional
    public void deleteDraftPage(Long pageId) {
        ChapterRevisionPage page = findRevisionPage(pageId);
        ChapterRevision revision = requireOwnedDraft(page.getRevision().getId());
        List<ChapterRevisionPage> remaining = new ArrayList<>(
                revisionPageRepository.findByRevision_IdOrderByPageNumberAsc(revision.getId()));
        remaining.removeIf(item -> Objects.equals(item.getId(), pageId));

        revisionPageRepository.delete(page);
        revisionPageRepository.flush();
        renumberPages(remaining);
        if (Boolean.TRUE.equals(page.getUploadedForRevision())) {
            deleteFileAfterCommit(page.getImageUrl());
        }
    }

    @Transactional
    public void deleteDraft(Long revisionId) {
        ChapterRevision revision = requireOwnedDraft(revisionId);
        List<String> uploadedPaths = revisionPageRepository
                .findByRevision_IdOrderByPageNumberAsc(revisionId)
                .stream()
                .filter(page -> Boolean.TRUE.equals(page.getUploadedForRevision()))
                .map(ChapterRevisionPage::getImageUrl)
                .toList();
        revisionRepository.delete(revision);
        revisionRepository.flush();
        deleteFilesAfterCommit(uploadedPaths);
    }

    @Transactional
    public ChapterRevisionResponse submit(Long revisionId) {
        ChapterRevision revision = requireOwnedDraft(revisionId);
        List<ChapterRevisionPage> pages = revisionPageRepository
                .findByRevision_IdOrderByPageNumberAsc(revisionId);
        if (pages.isEmpty()) {
            throw new IllegalArgumentException(
                    "Revision chapter phải có ít nhất một trang");
        }
        ensureSequentialPages(pages);
        revision.setStatus(PENDING);
        revision.setSubmittedAt(LocalDateTime.now());
        revision.setRejectReason(null);
        return toResponse(revisionRepository.save(revision), pages);
    }

    public List<ChapterRevisionResponse> getPendingRevisions() {
        requireModeratorOrAdmin();
        return revisionRepository.findByStatusOrderBySubmittedAtAsc(PENDING)
                .stream()
                .filter(revision -> isPublicChapter(revision.getChapter()))
                .map(revision -> toResponse(
                        revision,
                        revisionPageRepository.findByRevision_IdOrderByPageNumberAsc(
                                revision.getId())))
                .toList();
    }

    @Transactional
    public ChapterRevisionResponse approve(Long revisionId) {
        requireModeratorOrAdmin();
        ChapterRevision revision = findRevisionForUpdate(revisionId);
        requirePending(revision);
        Chapter chapter = revision.getChapter();
        if (!isPublicChapter(chapter)) {
            throw new DuplicateResourceException(
                    "Không thể duyệt revision của chapter không còn public");
        }
        User moderator = currentUser();
        rejectSelfModeration(revision, moderator);
        if (chapterRepository.existsByComic_IdAndChapterNumberAndIdNot(
                chapter.getComic().getId(), revision.getChapterNumber(), chapter.getId())) {
            throw new DuplicateResourceException(
                    "Số chapter đã được sử dụng trong truyện này");
        }

        List<ChapterRevisionPage> revisionPages = revisionPageRepository
                .findByRevision_IdOrderByPageNumberAsc(revisionId);
        if (revisionPages.isEmpty()) {
            throw new DuplicateResourceException(
                    "Revision không còn trang để áp dụng");
        }
        ensureSequentialPages(revisionPages);

        List<ChapterPage> oldPages = chapterPageRepository
                .findByChapter_IdOrderByPageNumberAsc(chapter.getId());
        Set<String> retainedPaths = new HashSet<>();
        revisionPages.forEach(page -> retainedPaths.add(page.getImageUrl()));
        List<String> filesToDelete = oldPages.stream()
                .map(ChapterPage::getImageUrl)
                .filter(path -> !retainedPaths.contains(path))
                .filter(path -> !revisionPageRepository
                        .existsByImageUrlAndRevision_IdNot(path, revisionId))
                .distinct()
                .toList();

        chapterPageRepository.deleteAll(oldPages);
        chapterPageRepository.flush();
        chapter.setChapterNumber(revision.getChapterNumber());
        chapter.setTitle(revision.getTitle());
        chapter.setPageCount(revisionPages.size());
        chapterRepository.save(chapter);

        List<ChapterPage> appliedPages = new ArrayList<>();
        for (ChapterRevisionPage revisionPage : revisionPages) {
            ChapterPage page = new ChapterPage();
            page.setChapter(chapter);
            page.setPageNumber(revisionPage.getPageNumber());
            page.setImageUrl(revisionPage.getImageUrl());
            page.setWidth(revisionPage.getWidth());
            page.setHeight(revisionPage.getHeight());
            page.setFileSize(revisionPage.getFileSize());
            appliedPages.add(page);
        }
        chapterPageRepository.saveAllAndFlush(appliedPages);

        LocalDateTime now = LocalDateTime.now();
        revision.setStatus(APPROVED);
        revision.setReviewer(moderator);
        revision.setReviewedAt(now);
        revision.setRejectReason(null);
        ChapterRevision saved = revisionRepository.save(revision);
        recordModeration(chapter, moderator, "APPROVE", "Duyệt revision chapter", now);
        deleteFilesAfterCommit(filesToDelete);
        return toResponse(saved, revisionPages);
    }

    @Transactional
    public ChapterRevisionResponse reject(Long revisionId, String note) {
        requireModeratorOrAdmin();
        validateRejectNote(note);
        ChapterRevision revision = findRevisionForUpdate(revisionId);
        requirePending(revision);
        if (!isPublicChapter(revision.getChapter())) {
            throw new DuplicateResourceException(
                    "Không thể từ chối revision của chapter không còn public");
        }
        User moderator = currentUser();
        rejectSelfModeration(revision, moderator);
        LocalDateTime now = LocalDateTime.now();
        revision.setStatus(REJECTED);
        revision.setRejectReason(note.trim());
        revision.setReviewer(moderator);
        revision.setReviewedAt(now);
        ChapterRevision saved = revisionRepository.save(revision);
        recordModeration(revision.getChapter(), moderator, "REJECT", note.trim(), now);
        return toResponse(saved,
                revisionPageRepository.findByRevision_IdOrderByPageNumberAsc(revisionId));
    }

    private ChapterRevisionPage snapshotPage(
            ChapterRevision revision, ChapterPage page) {
        ChapterRevisionPage snapshot = new ChapterRevisionPage();
        snapshot.setRevision(revision);
        snapshot.setPageNumber(page.getPageNumber());
        snapshot.setImageUrl(page.getImageUrl());
        snapshot.setWidth(page.getWidth());
        snapshot.setHeight(page.getHeight());
        snapshot.setFileSize(page.getFileSize());
        snapshot.setUploadedForRevision(false);
        return snapshot;
    }

    private ChapterRevisionResponse toResponse(
            ChapterRevision revision, List<ChapterRevisionPage> pages) {
        return new ChapterRevisionResponse(
                revision.getId(),
                revision.getChapter().getId(),
                revision.getChapterNumber(),
                revision.getTitle(),
                revision.getStatus(),
                revision.getRejectReason(),
                revision.getSubmittedBy().getUsername(),
                revision.getSubmittedAt(),
                revision.getReviewer() == null
                        ? null
                        : revision.getReviewer().getUsername(),
                revision.getReviewedAt(),
                pages.stream().map(this::toPageResponse).toList());
    }

    private ChapterPageResponse toPageResponse(ChapterRevisionPage page) {
        return new ChapterPageResponse(
                page.getId(),
                page.getPageNumber(),
                "/api/chapter-revision-pages/" + page.getId() + "/image",
                page.getWidth(),
                page.getHeight(),
                page.getFileSize());
    }

    private Chapter getOwnedPublishedChapter(Long chapterId) {
        requireRole("AUTHOR");
        Chapter chapter = findChapter(chapterId);
        validateOwner(chapter);
        if (!PUBLISHED.equals(chapter.getStatus()) || !isPublicComic(chapter.getComic())) {
            throw new DuplicateResourceException(
                    "Chỉ có thể tạo revision cho chapter đã xuất bản");
        }
        return chapter;
    }

    private ChapterRevision requireOwnedDraft(Long revisionId) {
        requireRole("AUTHOR");
        ChapterRevision revision = findRevisionForUpdate(revisionId);
        validateOwner(revision.getChapter());
        if (!DRAFT.equals(revision.getStatus())) {
            throw new DuplicateResourceException(
                    "Chỉ có thể chỉnh sửa revision ở trạng thái DRAFT");
        }
        return revision;
    }

    private ChapterRevision findRevisionForUpdate(Long revisionId) {
        validateId(revisionId);
        return revisionRepository.findWithDetailsById(revisionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chapter revision có ID: " + revisionId));
    }

    private ChapterRevisionPage findRevisionPage(Long pageId) {
        validateId(pageId);
        return revisionPageRepository.findWithDetailsById(pageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy trang revision có ID: " + pageId));
    }

    private Chapter findChapter(Long chapterId) {
        validateId(chapterId);
        Chapter chapter = chapterRepository.findWithDetailsById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy chapter có ID: " + chapterId));
        if (Boolean.TRUE.equals(chapter.getIsDeleted())
                || Boolean.TRUE.equals(chapter.getComic().getIsDeleted())) {
            throw new ResourceNotFoundException("Không tìm thấy chapter");
        }
        return chapter;
    }

    private void validateOwner(Chapter chapter) {
        User user = currentUser();
        if (!Objects.equals(chapter.getComic().getAuthor().getId(), user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền quản lý chapter này");
        }
    }

    private void requireOwnerOrModerator(Chapter chapter) {
        Authentication authentication = currentAuthentication();
        if (hasRole(authentication, "MODERATOR") || hasRole(authentication, "ADMIN")) {
            return;
        }
        requireRole("AUTHOR");
        validateOwner(chapter);
    }

    private boolean isPublicChapter(Chapter chapter) {
        return PUBLISHED.equals(chapter.getStatus())
                && !Boolean.TRUE.equals(chapter.getIsDeleted())
                && isPublicComic(chapter.getComic());
    }

    private boolean isPublicComic(Comic comic) {
        return PUBLISHED.equals(comic.getModerationStatus())
                && !Boolean.TRUE.equals(comic.getIsDeleted());
    }

    private void requirePending(ChapterRevision revision) {
        if (!PENDING.equals(revision.getStatus())) {
            throw new DuplicateResourceException(
                    "Chapter revision không ở trạng thái chờ kiểm duyệt");
        }
    }

    private void rejectSelfModeration(ChapterRevision revision, User moderator) {
        if (Objects.equals(revision.getSubmittedBy().getId(), moderator.getId())
                || Objects.equals(
                        revision.getChapter().getComic().getAuthor().getId(),
                        moderator.getId())) {
            throw new AccessDeniedException(
                    "Không thể tự kiểm duyệt chapter hoặc revision của mình");
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

    private void ensureSequentialPages(List<ChapterRevisionPage> pages) {
        for (int index = 0; index < pages.size(); index++) {
            if (!Objects.equals(pages.get(index).getPageNumber(), index + 1)) {
                throw new IllegalStateException(
                        "Số trang revision phải liên tiếp trước khi gửi duyệt");
            }
        }
    }

    private void renumberPages(List<ChapterRevisionPage> pages) {
        if (pages.isEmpty()) {
            return;
        }
        int maximum = pages.stream()
                .map(ChapterRevisionPage::getPageNumber)
                .max(Comparator.naturalOrder())
                .orElse(0);
        int offset = maximum + pages.size() + 1;
        pages.forEach(page -> page.setPageNumber(page.getPageNumber() + offset));
        revisionPageRepository.saveAllAndFlush(pages);
        for (int index = 0; index < pages.size(); index++) {
            pages.get(index).setPageNumber(index + 1);
        }
        revisionPageRepository.saveAllAndFlush(pages);
    }

    private String normalizeTitle(String title) {
        if (title == null) {
            return null;
        }
        if (title.isBlank()) {
            throw new IllegalArgumentException("Tiêu đề chapter không được để trống");
        }
        return title.trim();
    }

    private void validateRejectNote(String note) {
        if (note == null || note.isBlank()) {
            throw new IllegalArgumentException("MODERATOR phải ghi lý do từ chối");
        }
        if (note.length() > 500) {
            throw new IllegalArgumentException("Lý do từ chối tối đa 500 ký tự");
        }
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID phải là số nguyên dương");
        }
    }

    private User currentUser() {
        Authentication authentication = currentAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
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
            throw new AccessDeniedException(
                    "Chỉ MODERATOR hoặc ADMIN mới được kiểm duyệt chapter");
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> ("ROLE_" + role).equals(authority.getAuthority()));
    }

    private Authentication currentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private void deleteUploadsOnRollback(List<String> paths) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    paths.forEach(ChapterRevisionService.this::deleteFileAndLogFailure);
                }
            }
        });
    }

    private void deleteFileAfterCommit(String path) {
        deleteFilesAfterCommit(List.of(path));
    }

    private void deleteFilesAfterCommit(List<String> paths) {
        if (paths.isEmpty()) {
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED) {
                    paths.forEach(ChapterRevisionService.this::deleteFileAndLogFailure);
                }
            }
        });
    }

    private void deleteFileAndLogFailure(String path) {
        try {
            fileStorageService.delete(path);
        } catch (RuntimeException exception) {
            LOGGER.error("Không thể dọn tệp chapter revision: {}", path, exception);
        }
    }

    public record ImageFile(Path path, String contentType) {
    }
}
