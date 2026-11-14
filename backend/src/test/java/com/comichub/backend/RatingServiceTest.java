package com.comichub.backend;

import com.comichub.dto.rating.RatingRequest;
import com.comichub.entity.Comic;
import com.comichub.entity.Rating;
import com.comichub.entity.User;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.RatingRepository;
import com.comichub.repository.UserRepository;
import com.comichub.service.RatingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;
    @Mock
    private ComicRepository comicRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RatingService ratingService;

    @BeforeEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createsRatingAndRefreshesComicStats() {
        User reader = user(7L, "reader");
        Comic comic = comic(12L, "PUBLISHED", user(3L, "author"));
        setAuthentication("reader", "ROLE_USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reader));
        when(comicRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(comic));
        when(ratingRepository.findByUser_IdAndComic_Id(7L, 12L)).thenReturn(Optional.empty());
        when(ratingRepository.saveAndFlush(any(Rating.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(ratingRepository.summarize(12L)).thenReturn(summary(4.5, 2L));

        var result = ratingService.rateComic(12L, new RatingRequest(4, "  Hay lắm  "));

        assertEquals(12L, result.comicId());
        assertEquals(4, result.score());
        assertEquals("Hay lắm", result.review());
        assertEquals(new BigDecimal("4.50"), result.ratingAvg());
        assertEquals(2, result.ratingCount());
        verify(ratingRepository)
                .updateComicRatingStats(12L, new BigDecimal("4.50"), 2);
    }

    @Test
    void overwritesExistingRatingAndStoresBlankReviewAsNull() {
        User reader = user(7L, "reader");
        Comic comic = comic(12L, "PUBLISHED", user(3L, "author"));
        Rating existing = new Rating();
        existing.setId(99L);
        existing.setUser(reader);
        existing.setComic(comic);
        existing.setScore((byte) 2);
        existing.setReview("cũ");
        setAuthentication("reader", "ROLE_USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reader));
        when(comicRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(comic));
        when(ratingRepository.findByUser_IdAndComic_Id(7L, 12L))
                .thenReturn(Optional.of(existing));
        when(ratingRepository.saveAndFlush(any(Rating.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(ratingRepository.summarize(12L)).thenReturn(summary(5.0, 1L));

        var result = ratingService.rateComic(12L, new RatingRequest(5, "   "));

        assertEquals(5, result.score());
        assertNull(result.review());
        assertEquals((byte) 5, existing.getScore());
        verify(ratingRepository).saveAndFlush(existing);
        verify(ratingRepository)
                .updateComicRatingStats(12L, new BigDecimal("5.00"), 1);
    }

    @Test
    void authorCannotRateOwnComic() {
        User author = user(3L, "author");
        Comic comic = comic(12L, "PUBLISHED", author);
        setAuthentication("author", "ROLE_AUTHOR");
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
        when(comicRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(comic));

        assertThrows(AccessDeniedException.class,
                () -> ratingService.rateComic(12L, new RatingRequest(5, null)));
        verify(ratingRepository, never()).saveAndFlush(any(Rating.class));
    }

    @Test
    void cannotRateUnpublishedComic() {
        User reader = user(7L, "reader");
        Comic comic = comic(12L, "PENDING", user(3L, "author"));
        setAuthentication("reader", "ROLE_USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reader));
        when(comicRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(comic));

        assertThrows(ResourceNotFoundException.class,
                () -> ratingService.rateComic(12L, new RatingRequest(5, null)));
        verify(ratingRepository, never()).saveAndFlush(any(Rating.class));
    }

    @Test
    void moderatorWithoutReaderRoleCannotRate() {
        setAuthentication("mod", "ROLE_MODERATOR");

        assertThrows(AccessDeniedException.class,
                () -> ratingService.rateComic(12L, new RatingRequest(5, null)));
        verify(ratingRepository, never()).saveAndFlush(any(Rating.class));
    }

    @Test
    void rejectsReviewLongerThan300Characters() {
        User reader = user(7L, "reader");
        Comic comic = comic(12L, "PUBLISHED", user(3L, "author"));
        setAuthentication("reader", "ROLE_USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reader));
        when(comicRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(comic));

        assertThrows(IllegalArgumentException.class,
                () -> ratingService.rateComic(
                        12L, new RatingRequest(5, "x".repeat(301))));
        verify(ratingRepository, never()).saveAndFlush(any(Rating.class));
    }

    @Test
    void returnsNullScoreWhenUserHasNotRated() {
        User reader = user(7L, "reader");
        Comic comic = comic(12L, "PUBLISHED", user(3L, "author"));
        comic.setRatingAvg(new BigDecimal("3.50"));
        comic.setRatingCount(4);
        setAuthentication("reader", "ROLE_USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reader));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(ratingRepository.findByUser_IdAndComic_Id(7L, 12L)).thenReturn(Optional.empty());

        var result = ratingService.getMyRating(12L);

        assertNull(result.score());
        assertEquals(new BigDecimal("3.50"), result.ratingAvg());
        assertEquals(4, result.ratingCount());
    }

    // Không dùng Mockito ở đây: gọi when(...) bên trong thenReturn(...) của một
    // when(...) khác sẽ gây UnfinishedStubbingException.
    private RatingRepository.RatingSummary summary(Double average, Long total) {
        return new RatingRepository.RatingSummary() {
            @Override
            public Double getAverage() {
                return average;
            }

            @Override
            public Long getTotal() {
                return total;
            }
        };
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private Comic comic(Long id, String moderationStatus, User author) {
        Comic comic = new Comic();
        comic.setId(id);
        comic.setTitle("Comic " + id);
        comic.setSlug("comic-" + id);
        comic.setModerationStatus(moderationStatus);
        comic.setIsDeleted(false);
        comic.setAuthor(author);
        return comic;
    }

    private void setAuthentication(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority(role))));
    }
}