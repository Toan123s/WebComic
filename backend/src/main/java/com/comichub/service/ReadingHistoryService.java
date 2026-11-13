package com.comichub.service;

import com.comichub.dto.history.ReadingHistoryProgressRequest;
import com.comichub.dto.history.ReadingHistoryResponse;
import com.comichub.entity.Chapter;
import com.comichub.entity.Comic;
import com.comichub.entity.ReadingHistory;
import com.comichub.entity.User;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ChapterPageRepository;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ReadingHistoryRepository;
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
public class ReadingHistoryService {

    private static final String PUBLISHED = "PUBLISHED";

    private final ReadingHistoryRepository readingHistoryRepository;
    private final ChapterRepository chapterRepository;
    private final ChapterPageRepository chapterPageRepository;
    private final UserRepository userRepository;

    public ReadingHistoryService(
            ReadingHistoryRepository readingHistoryRepository,
            ChapterRepository chapterRepository,
            ChapterPageRepository chapterPageRepository,
            UserRepository userRepository) {
        this.readingHistoryRepository = readingHistoryRepository;
        this.chapterRepository = chapterRepository;
        this.chapterPageRepository = chapterPageRepository;
        this.userRepository = userRepository;
    }

    public List<ReadingHistoryResponse> getHistory() {
        requireReaderRole();
        User user = getCurrentUser();
        return readingHistoryRepository.findByUser_IdOrderByReadAtDesc(user.getId())
                .stream()
                .filter(history -> isPublicChapter(history.getChapter(), history.getComic()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReadingHistoryResponse saveProgress(ReadingHistoryProgressRequest request) {
        requireReaderRole();
        if (request == null || request.chapterId() == null || request.chapterId() <= 0
                || request.lastPageNumber() == null || request.lastPageNumber() <= 0) {
            throw new IllegalArgumentException(
                    "Chapter ID và số trang phải là số nguyên dương");
        }

        User user = getCurrentUser();
        Chapter chapter = chapterRepository.findWithDetailsById(request.chapterId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chapter"));
        Comic comic = chapter.getComic();
        validatePublicChapter(chapter, comic);
        if (!chapterPageRepository.existsByChapter_IdAndPageNumber(
                chapter.getId(), request.lastPageNumber())) {
            throw new IllegalArgumentException(
                    "Số trang không tồn tại trong chapter này");
        }

        ReadingHistory history = readingHistoryRepository
                .findByUser_IdAndComic_Id(user.getId(), comic.getId())
                .orElseGet(ReadingHistory::new);
        history.setUser(user);
        history.setComic(comic);
        history.setChapter(chapter);
        history.setLastPageNumber(request.lastPageNumber());
        history.setReadAt(LocalDateTime.now());

        return toResponse(readingHistoryRepository.save(history));
    }

    @Transactional
    public void deleteHistory(Long id) {
        requireReaderRole();
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "ID lịch sử đọc phải là số nguyên dương");
        }

        User user = getCurrentUser();
        ReadingHistory history = readingHistoryRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy lịch sử đọc có ID: " + id));
        readingHistoryRepository.delete(history);
    }

    private void validatePublicChapter(Chapter chapter, Comic comic) {
        if (!isPublicChapter(chapter, comic)) {
            throw new ResourceNotFoundException("Không tìm thấy chapter");
        }
    }

    private boolean isPublicChapter(Chapter chapter, Comic comic) {
        return PUBLISHED.equals(chapter.getStatus())
                && !Boolean.TRUE.equals(chapter.getIsDeleted())
                && PUBLISHED.equals(comic.getModerationStatus())
                && !Boolean.TRUE.equals(comic.getIsDeleted());
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

    private void requireReaderRole() {
        Authentication authentication = currentAuthentication();
        boolean hasReaderRole = authentication != null && authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> Objects.equals(authority.getAuthority(), "ROLE_USER")
                        || Objects.equals(authority.getAuthority(), "ROLE_AUTHOR"));
        if (!hasReaderRole) {
            throw new AccessDeniedException(
                    "Chỉ USER hoặc AUTHOR mới được sử dụng lịch sử đọc");
        }
    }

    private Authentication currentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private ReadingHistoryResponse toResponse(ReadingHistory history) {
        Comic comic = history.getComic();
        Chapter chapter = history.getChapter();
        return new ReadingHistoryResponse(
                history.getId(),
                comic.getId(),
                comic.getTitle(),
                comic.getSlug(),
                comic.getCoverUrl(),
                chapter.getId(),
                chapter.getChapterNumber(),
                chapter.getTitle(),
                history.getLastPageNumber(),
                chapter.getPageCount(),
                history.getReadAt());
    }
}
