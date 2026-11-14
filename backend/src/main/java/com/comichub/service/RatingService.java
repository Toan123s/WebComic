/**
 * DỰ ÁN: ComicHub
 * FILE: RatingService.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Xử lý nghiệp vụ đánh giá (rating) truyện.
 * TRẠNG THÁI: ĐÃ XÁC MINH TRÊN SQL SERVER; review tối đa 300 ký tự.
 * User chỉ chấm Comic PUBLISHED; score được map với cột TINYINT.
 * LƯU Ý: Mỗi user một đánh giá cho mỗi truyện (PUT là tạo mới hoặc ghi đè);
 *        tác giả không được chấm truyện của chính mình.
 */

package com.comichub.service;

import com.comichub.dto.rating.RatingRequest;
import com.comichub.dto.rating.RatingResponse;
import com.comichub.entity.Comic;
import com.comichub.entity.Rating;
import com.comichub.entity.User;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.RatingRepository;
import com.comichub.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class RatingService {

    private static final String PUBLISHED = "PUBLISHED";

    private final RatingRepository ratingRepository;
    private final ComicRepository comicRepository;
    private final UserRepository userRepository;

    public RatingService(
            RatingRepository ratingRepository,
            ComicRepository comicRepository,
            UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.comicRepository = comicRepository;
        this.userRepository = userRepository;
    }

    /** Đánh giá của người dùng hiện tại kèm điểm trung bình của truyện. */
    public RatingResponse getMyRating(Long comicId) {
        requireReaderRole();
        User user = getCurrentUser();
        Comic comic = findPublicComic(comicId);

        return ratingRepository.findByUser_IdAndComic_Id(user.getId(), comic.getId())
                .map(rating -> toResponse(
                        comic.getId(), rating,
                        comic.getRatingAvg(), comic.getRatingCount()))
                .orElseGet(() -> new RatingResponse(
                        comic.getId(), null, null,
                        comic.getRatingAvg(), comic.getRatingCount(), null));
    }

    @Transactional
    public RatingResponse rateComic(Long comicId, RatingRequest request) {
        requireReaderRole();
        User user = getCurrentUser();
        Comic comic = findPublicComicForUpdate(comicId);

        if (comic.getAuthor() != null
                && Objects.equals(comic.getAuthor().getId(), user.getId())) {
            throw new AccessDeniedException(
                    "Tác giả không thể đánh giá truyện của chính mình");
        }

        Rating rating = ratingRepository
                .findByUser_IdAndComic_Id(user.getId(), comic.getId())
                .orElseGet(() -> {
                    Rating created = new Rating();
                    created.setUser(user);
                    created.setComic(comic);
                    return created;
                });
        rating.setScore(request.score().byteValue());
        rating.setReview(normalizeReview(request.review()));

        // Flush để câu AVG/COUNT bên dưới đã thấy đánh giá vừa lưu.
        Rating saved = ratingRepository.saveAndFlush(rating);

        RatingRepository.RatingSummary summary = ratingRepository.summarize(comic.getId());
        int total = summary.getTotal() == null ? 0 : summary.getTotal().intValue();
        BigDecimal average = summary.getAverage() == null
                ? BigDecimal.ZERO.setScale(2)
                : BigDecimal.valueOf(summary.getAverage()).setScale(2, RoundingMode.HALF_UP);
        ratingRepository.updateComicRatingStats(comic.getId(), average, total);

        return toResponse(comic.getId(), saved, average, total);
    }

    private Comic findPublicComic(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID truyện phải là số nguyên dương");
        }
        return comicRepository.findWithAuthorById(id)
                .filter(comic -> PUBLISHED.equals(comic.getModerationStatus())
                        && !Boolean.TRUE.equals(comic.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy truyện"));
    }

    private Comic findPublicComicForUpdate(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID truyện phải là số nguyên dương");
        }
        return comicRepository.findByIdForUpdate(id)
                .filter(comic -> PUBLISHED.equals(comic.getModerationStatus())
                        && !Boolean.TRUE.equals(comic.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy truyện"));
    }

    private String normalizeReview(String review) {
        if (review == null) {
            return null;
        }
        String trimmed = review.trim();
        if (trimmed.length() > 300) {
            throw new IllegalArgumentException("review tối đa 300 ký tự");
        }
        return trimmed.isEmpty() ? null : trimmed;
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

    private void requireReaderRole() {
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        boolean canRate = authentication != null && authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> Objects.equals(authority.getAuthority(), "ROLE_USER")
                        || Objects.equals(authority.getAuthority(), "ROLE_AUTHOR"));
        if (!canRate) {
            throw new AccessDeniedException("Bạn không có quyền đánh giá truyện");
        }
    }

    private RatingResponse toResponse(
            Long comicId, Rating rating, BigDecimal average, Integer total) {
        return new RatingResponse(
                comicId,
                rating.getScore() == null ? null : rating.getScore().intValue(),
                rating.getReview(),
                average,
                total,
                rating.getUpdatedAt());
    }
}