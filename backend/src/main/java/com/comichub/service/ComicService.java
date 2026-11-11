package com.comichub.service;

import com.comichub.dto.comic.ComicCreateRequest;
import com.comichub.dto.comic.ComicEditResponse;
import com.comichub.dto.comic.ComicResponse;
import com.comichub.dto.comic.ComicRevisionResponse;
import com.comichub.dto.comic.ComicSummaryResponse;
import com.comichub.dto.comic.ComicUpdateRequest;
import com.comichub.entity.Comic;
import com.comichub.entity.ComicRevision;
import com.comichub.entity.ModerationLog;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.mapper.ComicMapper;
import com.comichub.mapper.ComicRevisionMapper;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.ComicRevisionRepository;
import com.comichub.repository.ModerationLogRepository;
import com.comichub.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class ComicService {

    private static final String DRAFT = "DRAFT";
    private static final String PENDING = "PENDING";
    private static final String REJECTED = "REJECTED";
    private static final String PUBLISHED = "PUBLISHED";

    private final ComicRepository comicRepository;
    private final ComicRevisionRepository comicRevisionRepository;
    private final ModerationLogRepository moderationLogRepository;
    private final UserRepository userRepository;
    private final ComicMapper comicMapper;
    private final ComicRevisionMapper comicRevisionMapper;

    public ComicService(
            ComicRepository comicRepository,
            ComicRevisionRepository comicRevisionRepository,
            ModerationLogRepository moderationLogRepository,
            UserRepository userRepository,
            ComicMapper comicMapper,
            ComicRevisionMapper comicRevisionMapper) {
        this.comicRepository = comicRepository;
        this.comicRevisionRepository = comicRevisionRepository;
        this.moderationLogRepository = moderationLogRepository;
        this.userRepository = userRepository;
        this.comicMapper = comicMapper;
        this.comicRevisionMapper = comicRevisionMapper;
    }

    public List<ComicSummaryResponse> getPublicComics() {
        return comicRepository
                .findByModerationStatusAndIsDeletedFalseOrderByPublishedAtDesc(PUBLISHED)
                .stream()
                .map(comicMapper::toSummaryResponse)
                .toList();
    }

    public List<ComicSummaryResponse> getMyComics() {
        requireRole("AUTHOR");
        User author = getCurrentUser();
        return comicRepository.findByAuthor_IdAndIsDeletedFalseOrderByCreatedAtDesc(author.getId())
                .stream()
                .map(comicMapper::toSummaryResponse)
                .toList();
    }

    public ComicResponse getComicById(Long id) {
        validateId(id);
        Comic comic = findComicById(id);
        validateNotDeleted(comic);
        if (PUBLISHED.equals(comic.getModerationStatus())) {
            return comicMapper.toResponse(comic);
        }

        Authentication authentication = currentAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResourceNotFoundException("Không tìm thấy truyện");
        }

        User user = getCurrentUser();
        boolean owner = comic.getAuthor().getId().equals(user.getId());
        if (!owner && !hasRole(authentication, "MODERATOR") && !hasRole(authentication, "ADMIN")) {
            throw new ResourceNotFoundException("Không tìm thấy truyện");
        }
        return comicMapper.toResponse(comic);
    }

    @Transactional
    public ComicResponse createComic(ComicCreateRequest request) {
        requireRole("AUTHOR");
        User author = getCurrentUser();

        Comic comic = new Comic();
        comic.setAuthor(author);
        comic.setTitle(request.title().trim());
        comic.setSlug(generateUniqueSlug(request.title()));
        comic.setDescription(request.description());
        comic.setCoverUrl(request.coverUrl());
        comic.setModerationStatus(DRAFT);
        comic.setPublicationStatus(
                request.publicationStatus() == null ? "ONGOING" : request.publicationStatus());
        comic.setViewCount(0L);
        comic.setIsDeleted(false);

        return comicMapper.toResponse(comicRepository.save(comic));
    }

    @Transactional
    public ComicEditResponse updateComic(Long id, ComicUpdateRequest request) {
        validateId(id);
        validateHasChanges(request);

        Comic comic = findComicById(id);
        validateOwnership(comic);
        validateNotDeleted(comic);
        validateUpdateTitle(request.title());

        if (PUBLISHED.equals(comic.getModerationStatus())) {
            if (comicRevisionRepository.existsByComic_IdAndStatus(id, PENDING)) {
                throw new DuplicateResourceException(
                        "Truyện đã có bản sửa đang chờ kiểm duyệt");
            }
            ComicRevision revision = createRevision(comic, request, getCurrentUser());
            ComicRevision savedRevision = comicRevisionRepository.save(revision);
            return new ComicEditResponse(
                    comicMapper.toResponse(comic),
                    comicRevisionMapper.toResponse(savedRevision));
        }

        if (!DRAFT.equals(comic.getModerationStatus())
                && !REJECTED.equals(comic.getModerationStatus())) {
            throw new DuplicateResourceException("Truyện hiện không thể chỉnh sửa");
        }

        applyChanges(comic, request);
        return new ComicEditResponse(comicMapper.toResponse(comic), null);
    }

    @Transactional
    public ComicResponse submitForReview(Long id) {
        validateId(id);
        Comic comic = findComicById(id);
        validateOwnership(comic);
        validateNotDeleted(comic);
        if (!DRAFT.equals(comic.getModerationStatus())
                && !REJECTED.equals(comic.getModerationStatus())) {
            throw new DuplicateResourceException("Truyện không ở trạng thái có thể gửi duyệt");
        }

        comic.setModerationStatus(PENDING);
        comic.setRejectReason(null);
        comic.setReviewer(null);
        comic.setReviewedAt(null);
        comic.setSubmittedAt(LocalDateTime.now());
        return comicMapper.toResponse(comicRepository.save(comic));
    }

    public List<ComicResponse> getPendingComics() {
        requireRole("MODERATOR");
        return comicRepository
                .findByModerationStatusAndIsDeletedFalseOrderBySubmittedAtAsc(PENDING)
                .stream()
                .map(comicMapper::toResponse)
                .toList();
    }

    @Transactional
    public ComicResponse approveComic(Long id) {
        requireRole("MODERATOR");
        Comic comic = findComicById(id);
        validateNotDeleted(comic);
        if (!PENDING.equals(comic.getModerationStatus())) {
            throw new DuplicateResourceException("Truyện không ở trạng thái chờ kiểm duyệt");
        }

        User moderator = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        comic.setModerationStatus(PUBLISHED);
        comic.setReviewer(moderator);
        comic.setReviewedAt(now);
        comic.setPublishedAt(now);
        comic.setRejectReason(null);
        comicRepository.save(comic);
        recordModeration(comic, moderator, "APPROVE", null, now);
        return comicMapper.toResponse(comic);
    }

    @Transactional
    public ComicResponse rejectComic(Long id, String note) {
        requireRole("MODERATOR");
        validateRejectNote(note);
        Comic comic = findComicById(id);
        validateNotDeleted(comic);
        if (!PENDING.equals(comic.getModerationStatus())) {
            throw new DuplicateResourceException("Truyện không ở trạng thái chờ kiểm duyệt");
        }

        User moderator = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        comic.setModerationStatus(REJECTED);
        comic.setReviewer(moderator);
        comic.setReviewedAt(now);
        comic.setRejectReason(note.trim());
        comicRepository.save(comic);
        recordModeration(comic, moderator, "REJECT", note.trim(), now);
        return comicMapper.toResponse(comic);
    }

    public List<ComicRevisionResponse> getPendingRevisions() {
        requireRole("MODERATOR");
        return comicRevisionRepository.findByStatusOrderBySubmittedAtAsc(PENDING)
                .stream()
                .filter(revision -> !Boolean.TRUE.equals(revision.getComic().getIsDeleted()))
                .map(comicRevisionMapper::toResponse)
                .toList();
    }

    public List<ComicRevisionResponse> getComicRevisions(Long comicId) {
        validateId(comicId);
        Comic comic = findComicById(comicId);
        validateNotDeleted(comic);

        Authentication authentication = currentAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("Bạn cần đăng nhập để xem lịch sử bản sửa");
        }

        User currentUser = getCurrentUser();
        boolean owner = comic.getAuthor().getId().equals(currentUser.getId());
        if (!owner && !hasRole(authentication, "MODERATOR") && !hasRole(authentication, "ADMIN")) {
            throw new AccessDeniedException("Bạn không có quyền xem lịch sử bản sửa này");
        }

        return comicRevisionRepository.findByComic_IdOrderBySubmittedAtDesc(comicId)
                .stream()
                .map(comicRevisionMapper::toResponse)
                .toList();
    }

    @Transactional
    public ComicRevisionResponse approveRevision(Long revisionId) {
        requireRole("MODERATOR");
        ComicRevision revision = findPendingRevision(revisionId);
        Comic comic = revision.getComic();
        validateNotDeleted(comic);

        comic.setTitle(revision.getTitle());
        comic.setDescription(revision.getDescription());
        comic.setCoverUrl(revision.getCoverUrl());
        comic.setPublicationStatus(revision.getPublicationStatus());

        User moderator = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        revision.setStatus("APPROVED");
        revision.setReviewer(moderator);
        revision.setReviewedAt(now);
        comicRepository.save(comic);
        ComicRevision savedRevision = comicRevisionRepository.save(revision);
        recordModeration(comic, moderator, "APPROVE", "Duyệt bản cập nhật", now);
        return comicRevisionMapper.toResponse(savedRevision);
    }

    @Transactional
    public ComicRevisionResponse rejectRevision(Long revisionId, String note) {
        requireRole("MODERATOR");
        validateRejectNote(note);
        ComicRevision revision = findPendingRevision(revisionId);
        validateNotDeleted(revision.getComic());

        User moderator = getCurrentUser();
        LocalDateTime now = LocalDateTime.now();
        revision.setStatus(REJECTED);
        revision.setRejectReason(note.trim());
        revision.setReviewer(moderator);
        revision.setReviewedAt(now);
        ComicRevision savedRevision = comicRevisionRepository.save(revision);
        recordModeration(revision.getComic(), moderator, "REJECT", note.trim(), now);
        return comicRevisionMapper.toResponse(savedRevision);
    }

    @Transactional
    public void deleteComic(Long id) {
        validateId(id);
        Comic comic = findComicById(id);
        validateNotDeleted(comic);

        User currentUser = getCurrentUser();
        boolean owner = comic.getAuthor().getId().equals(currentUser.getId());
        Authentication authentication = currentAuthentication();
        if (!owner && !hasRole(authentication, "ADMIN")) {
            throw new AccessDeniedException("Bạn không có quyền xóa truyện này");
        }
        comic.setIsDeleted(true);
    }

    private ComicRevision createRevision(
            Comic comic,
            ComicUpdateRequest request,
            User author) {
        ComicRevision revision = new ComicRevision();
        revision.setComic(comic);
        revision.setSubmittedBy(author);
        revision.setTitle(request.title() == null ? comic.getTitle() : request.title().trim());
        revision.setDescription(
                request.description() == null ? comic.getDescription() : request.description());
        revision.setCoverUrl(request.coverUrl() == null ? comic.getCoverUrl() : request.coverUrl());
        revision.setPublicationStatus(
                request.publicationStatus() == null
                        ? comic.getPublicationStatus()
                        : request.publicationStatus());
        revision.setStatus(PENDING);
        revision.setSubmittedAt(LocalDateTime.now());
        return revision;
    }

    private void applyChanges(Comic comic, ComicUpdateRequest request) {
        if (request.title() != null) {
            comic.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            comic.setDescription(request.description());
        }
        if (request.coverUrl() != null) {
            comic.setCoverUrl(request.coverUrl());
        }
        if (request.publicationStatus() != null) {
            comic.setPublicationStatus(request.publicationStatus());
        }
    }

    private Comic findComicById(Long id) {
        return comicRepository.findWithAuthorById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy truyện có ID: " + id));
    }

    private ComicRevision findPendingRevision(Long revisionId) {
        if (revisionId == null || revisionId <= 0) {
            throw new IllegalArgumentException("ID bản sửa phải là số nguyên dương");
        }
        ComicRevision revision = comicRevisionRepository.findWithDetailsById(revisionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bản sửa có ID: " + revisionId));
        if (!PENDING.equals(revision.getStatus())) {
            throw new DuplicateResourceException("Bản sửa không ở trạng thái chờ kiểm duyệt");
        }
        return revision;
    }

    private User getCurrentUser() {
        Authentication authentication = currentAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("Bạn chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản: " + authentication.getName()));
    }

    private void validateOwnership(Comic comic) {
        User currentUser = getCurrentUser();
        if (!comic.getAuthor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền chỉnh sửa truyện này");
        }
        requireRole("AUTHOR");
    }

    private void requireRole(String role) {
        if (!hasRole(currentAuthentication(), role)) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện thao tác này");
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> Objects.equals(
                        authority.getAuthority(), "ROLE_" + role));
    }

    private Authentication currentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private void validateNotDeleted(Comic comic) {
        if (Boolean.TRUE.equals(comic.getIsDeleted())) {
            throw new ResourceNotFoundException("Truyện không tồn tại");
        }
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID truyện phải là số nguyên dương");
        }
    }

    private void validateHasChanges(ComicUpdateRequest request) {
        if (request.title() == null && request.description() == null
                && request.coverUrl() == null && request.publicationStatus() == null) {
            throw new IllegalArgumentException("Cần cung cấp ít nhất một trường để cập nhật");
        }
    }

    private void validateUpdateTitle(String title) {
        if (title != null && title.isBlank()) {
            throw new IllegalArgumentException("Tên truyện không được để trống");
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

    private void recordModeration(
            Comic comic,
            User moderator,
            String action,
            String note,
            LocalDateTime createdAt) {
        ModerationLog log = new ModerationLog();
        log.setComic(comic);
        log.setModerator(moderator);
        log.setAction(action);
        log.setNote(note);
        log.setCreatedAt(createdAt);
        moderationLogRepository.save(log);
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = generateSlug(title);
        String slug = baseSlug;
        int suffix = 2;
        while (comicRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + suffix++;
        }
        return slug;
    }

    private String generateSlug(String title) {
        String normalized = Normalizer.normalize(
                title.toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        String slug = normalized.replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return slug.isBlank() ? "comic" : slug;
    }
}
