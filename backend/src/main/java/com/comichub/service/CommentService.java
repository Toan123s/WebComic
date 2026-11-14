package com.comichub.service;

import com.comichub.dto.comment.CommentCreateRequest;
import com.comichub.dto.comment.CommentResponse;
import com.comichub.dto.comment.CommentUpdateRequest;
import com.comichub.entity.Chapter;
import com.comichub.entity.Comment;
import com.comichub.entity.Comic;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.CommentRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class CommentService {

    private static final String PUBLISHED = "PUBLISHED";
    private static final String PENDING = "PENDING";
    private static final String VISIBLE = "VISIBLE";
    private static final String REJECTED = "REJECTED";
    private static final String HIDDEN = "HIDDEN";
    private static final String DELETED = "DELETED";

    private final CommentRepository commentRepository;
    private final ComicRepository comicRepository;
    private final ChapterRepository chapterRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            ComicRepository comicRepository,
            ChapterRepository chapterRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.comicRepository = comicRepository;
        this.chapterRepository = chapterRepository;
        this.userRepository = userRepository;
    }

    public List<CommentResponse> getComments(Long comicId, Long chapterId) {
        validateId(comicId, "ID truyện");
        Comic comic = findPublicComic(comicId);
        if (chapterId != null) {
            validateId(chapterId, "ID chapter");
            Chapter chapter = findChapter(chapterId);
            if (!Objects.equals(chapter.getComic().getId(), comic.getId())
                    || !isPublicChapter(chapter)) {
                throw new ResourceNotFoundException("Không tìm thấy chapter");
            }
        }

        Long viewerId = currentUserId();
        boolean moderatorView = hasRole("MODERATOR") || hasRole("ADMIN");
        return commentRepository.findVisibleForViewer(
                        comic.getId(), chapterId, viewerId, moderatorView)
                .stream()
                .map(comment -> toResponse(
                        comment,
                        viewerId,
                        moderatorView))
                .toList();
    }

    @Transactional
    public CommentResponse createComment(Long comicId, CommentCreateRequest request) {
        requireReaderRole();
        User user = getCurrentUser();
        Comic comic = findPublicComic(comicId);
        Chapter chapter = request.chapterId() == null
                ? null
                : findPublicChapterInComic(request.chapterId(), comic);

        Comment parent = null;
        if (request.parentId() != null) {
            parent = findComment(request.parentId());
            if (!VISIBLE.equals(parent.getStatus())
                    || !Objects.equals(parent.getComic().getId(), comic.getId())
                    || !sameChapter(parent.getChapter(), chapter)) {
                throw new IllegalArgumentException(
                        "Chỉ có thể trả lời bình luận đang hiển thị trong cùng truyện/chapter");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        Comment comment = new Comment();
        comment.setUser(user);
        comment.setComic(comic);
        comment.setChapter(chapter);
        comment.setParent(parent);
        comment.setContent(request.content().trim());
        comment.setStatus(PENDING);
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);
        return toResponse(commentRepository.save(comment), user.getId(), false);
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentUpdateRequest request) {
        User user = requireReaderRoleAndGetUser();
        Comment comment = findComment(commentId);
        requireOwner(comment, user);
        if (HIDDEN.equals(comment.getStatus()) || DELETED.equals(comment.getStatus())) {
            throw new DuplicateResourceException(
                    "Không thể chỉnh sửa bình luận đã ẩn hoặc đã xóa");
        }

        comment.setContent(request.content().trim());
        comment.setStatus(PENDING);
        comment.setHiddenBy(null);
        comment.setHiddenReason(null);
        comment.setUpdatedAt(LocalDateTime.now());
        return toResponse(commentRepository.save(comment), user.getId(), false);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        User user = requireReaderRoleAndGetUser();
        Comment comment = findComment(commentId);
        requireOwner(comment, user);
        if (DELETED.equals(comment.getStatus())) {
            throw new ResourceNotFoundException("Không tìm thấy bình luận");
        }
        comment.setStatus(DELETED);
        comment.setUpdatedAt(LocalDateTime.now());
    }

    public List<CommentResponse> getPendingComments() {
        requireModeratorOrAdmin();
        return commentRepository.findByStatusOrderByCreatedAtAsc(PENDING)
                .stream()
                .map(comment -> toResponse(comment, null, true))
                .toList();
    }

    @Transactional
    public CommentResponse approveComment(Long commentId) {
        User moderator = requireModeratorOrAdminAndGetUser();
        Comment comment = findComment(commentId);
        requirePending(comment);
        rejectSelfModeration(comment, moderator);
        comment.setStatus(VISIBLE);
        comment.setHiddenBy(null);
        comment.setHiddenReason(null);
        comment.setUpdatedAt(LocalDateTime.now());
        return toResponse(commentRepository.save(comment), moderator.getId(), true);
    }

    @Transactional
    public CommentResponse rejectComment(Long commentId, String reason) {
        User moderator = requireModeratorOrAdminAndGetUser();
        String normalizedReason = validateModerationReason(reason);
        Comment comment = findComment(commentId);
        requirePending(comment);
        rejectSelfModeration(comment, moderator);
        comment.setStatus(REJECTED);
        comment.setHiddenBy(moderator);
        comment.setHiddenReason(normalizedReason);
        comment.setUpdatedAt(LocalDateTime.now());
        return toResponse(commentRepository.save(comment), moderator.getId(), true);
    }

    @Transactional
    public CommentResponse hideComment(Long commentId, String reason) {
        User moderator = requireModeratorOrAdminAndGetUser();
        String normalizedReason = validateModerationReason(reason);
        Comment comment = findComment(commentId);
        if (!VISIBLE.equals(comment.getStatus())) {
            throw new DuplicateResourceException(
                    "Chỉ có thể ẩn bình luận đang hiển thị");
        }
        rejectSelfModeration(comment, moderator);
        comment.setStatus(HIDDEN);
        comment.setHiddenBy(moderator);
        comment.setHiddenReason(normalizedReason);
        comment.setUpdatedAt(LocalDateTime.now());
        return toResponse(commentRepository.save(comment), moderator.getId(), true);
    }

    private Comment findComment(Long id) {
        validateId(id, "ID bình luận");
        return commentRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bình luận"));
    }

    private Comic findPublicComic(Long id) {
        validateId(id, "ID truyện");
        return comicRepository.findWithAuthorById(id)
                .filter(comic -> isPublicComic(comic))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy truyện"));
    }

    private Chapter findChapter(Long id) {
        return chapterRepository.findWithDetailsById(id)
                .filter(chapter -> !Boolean.TRUE.equals(chapter.getIsDeleted())
                        && !Boolean.TRUE.equals(chapter.getComic().getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chapter"));
    }

    private Chapter findPublicChapterInComic(Long chapterId, Comic comic) {
        validateId(chapterId, "ID chapter");
        Chapter chapter = findChapter(chapterId);
        if (!Objects.equals(chapter.getComic().getId(), comic.getId())
                || !isPublicChapter(chapter)) {
            throw new ResourceNotFoundException("Không tìm thấy chapter");
        }
        return chapter;
    }

    private boolean isPublicComic(Comic comic) {
        return PUBLISHED.equals(comic.getModerationStatus())
                && !Boolean.TRUE.equals(comic.getIsDeleted());
    }

    private boolean isPublicChapter(Chapter chapter) {
        return PUBLISHED.equals(chapter.getStatus()) && isPublicComic(chapter.getComic());
    }

    private boolean sameChapter(Chapter first, Chapter second) {
        return first == null ? second == null
                : second != null && Objects.equals(first.getId(), second.getId());
    }

    private void requirePending(Comment comment) {
        if (!PENDING.equals(comment.getStatus())) {
            throw new DuplicateResourceException(
                    "Bình luận không ở trạng thái chờ kiểm duyệt");
        }
    }

    private String validateModerationReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Lý do kiểm duyệt không được để trống");
        }
        String normalized = reason.trim();
        if (normalized.length() > 300) {
            throw new IllegalArgumentException("Lý do kiểm duyệt tối đa 300 ký tự");
        }
        return normalized;
    }

    private void requireOwner(Comment comment, User user) {
        if (!Objects.equals(comment.getUser().getId(), user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền sửa bình luận này");
        }
    }

    private void rejectSelfModeration(Comment comment, User moderator) {
        if (Objects.equals(comment.getUser().getId(), moderator.getId())) {
            throw new AccessDeniedException(
                    "Không thể tự kiểm duyệt bình luận của mình");
        }
    }

    private CommentResponse toResponse(
            Comment comment, Long viewerId, boolean moderatorView) {
        boolean canSeeReason = moderatorView
                || (viewerId != null
                && Objects.equals(comment.getUser().getId(), viewerId));
        return new CommentResponse(
                comment.getId(),
                comment.getComic().getId(),
                comment.getChapter() == null ? null : comment.getChapter().getId(),
                comment.getParent() == null ? null : comment.getParent().getId(),
                comment.getUser().getId(),
                comment.getUser().getUsername(),
                comment.getContent(),
                comment.getStatus(),
                canSeeReason ? comment.getHiddenReason() : null,
                comment.getCreatedAt(),
                comment.getUpdatedAt());
    }

    private User requireReaderRoleAndGetUser() {
        requireReaderRole();
        return getCurrentUser();
    }

    private User requireModeratorOrAdminAndGetUser() {
        requireModeratorOrAdmin();
        return getCurrentUser();
    }

    private User getCurrentUser() {
        Authentication authentication = currentAuthentication();
        if (!isAuthenticated(authentication)) {
            throw new AccessDeniedException("Bạn chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản hiện tại"));
    }

    private Long currentUserId() {
        Authentication authentication = currentAuthentication();
        if (!isAuthenticated(authentication)) {
            return null;
        }
        return userRepository.findByUsername(authentication.getName())
                .map(User::getId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản hiện tại"));
    }

    private void requireReaderRole() {
        if (!hasRole("USER") && !hasRole("AUTHOR")) {
            throw new AccessDeniedException(
                    "Chỉ USER hoặc AUTHOR mới được bình luận");
        }
    }

    private void requireModeratorOrAdmin() {
        if (!hasRole("MODERATOR") && !hasRole("ADMIN")) {
            throw new AccessDeniedException(
                    "Bạn không có quyền kiểm duyệt bình luận");
        }
    }

    private boolean hasRole(String role) {
        Authentication authentication = currentAuthentication();
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

    private void validateId(Long id, String label) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(label + " phải là số nguyên dương");
        }
    }
}
