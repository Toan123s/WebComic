/**
 * DỰ ÁN: ComicHub
 * FILE: BookmarkService.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Xử lý nghiệp vụ cho chức năng Bookmark.
 * TRẠNG THÁI: ĐÃ TRIỂN KHAI; USER/AUTHOR ĐƯỢC PHÉP, CÓ KIỂM TRA OWNERSHIP.
 * CÒN THIẾU: Không thuộc phạm vi RBAC hiện tại.
 * LƯU Ý: Triển khai validation nghiệp vụ, ownership/trạng thái, lỗi và transaction khi cần; phối hợp schema/API contract.
 */

package com.comichub.service;

import com.comichub.dto.bookmark.BookmarkRequest;
import com.comichub.dto.bookmark.BookmarkResponse;
import com.comichub.entity.Bookmark;
import com.comichub.entity.Comic;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.BookmarkRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class BookmarkService {

    private static final String PUBLISHED = "PUBLISHED";

    private final BookmarkRepository bookmarkRepository;
    private final ComicRepository comicRepository;
    private final UserRepository userRepository;

    public BookmarkService(
            BookmarkRepository bookmarkRepository,
            ComicRepository comicRepository,
            UserRepository userRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.comicRepository = comicRepository;
        this.userRepository = userRepository;
    }

    public List<BookmarkResponse> getBookmarks() {
        requireReaderRole();
        User user = getCurrentUser();
        return bookmarkRepository.findByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookmarkResponse addBookmark(BookmarkRequest request) {
        requireReaderRole();
        User user = getCurrentUser();
        Comic comic = findComic(request.comicId());
        if (!isPublicComic(comic)) {
            throw new ResourceNotFoundException("Không tìm thấy truyện");
        }
        if (bookmarkRepository.existsByUser_IdAndComic_Id(user.getId(), comic.getId())) {
            throw new DuplicateResourceException("Truyện đã có trong danh sách bookmark");
        }

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setComic(comic);
        return toResponse(bookmarkRepository.save(bookmark));
    }

    @Transactional
    public void removeBookmark(Long id) {
        requireReaderRole();
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID bookmark phải là số nguyên dương");
        }
        User user = getCurrentUser();
        Bookmark bookmark = bookmarkRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bookmark có ID: " + id));
        bookmarkRepository.delete(bookmark);
    }

    private Comic findComic(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID truyện phải là số nguyên dương");
        }
        return comicRepository.findWithAuthorById(id)
                .filter(comic -> !Boolean.TRUE.equals(comic.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy truyện"));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("Bạn chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản: " + authentication.getName()));
    }

    private boolean isPublicComic(Comic comic) {
        return PUBLISHED.equals(comic.getModerationStatus())
                && !Boolean.TRUE.equals(comic.getIsDeleted());
    }

    private void requireReaderRole() {
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        boolean canReadAsUser = authentication != null && authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> Objects.equals(authority.getAuthority(), "ROLE_USER")
                        || Objects.equals(authority.getAuthority(), "ROLE_AUTHOR"));
        if (!canReadAsUser) {
            throw new AccessDeniedException("Bạn không có quyền sử dụng bookmark");
        }
    }

    private BookmarkResponse toResponse(Bookmark bookmark) {
        Comic comic = bookmark.getComic();
        return new BookmarkResponse(
                bookmark.getId(),
                comic.getId(),
                comic.getTitle(),
                comic.getSlug(),
                comic.getCoverUrl(),
                bookmark.getCreatedAt());
    }
}
