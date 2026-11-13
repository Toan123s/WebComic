package com.comichub.backend;

import com.comichub.dto.history.ReadingHistoryProgressRequest;
import com.comichub.entity.Chapter;
import com.comichub.entity.Comic;
import com.comichub.entity.ReadingHistory;
import com.comichub.entity.User;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ChapterPageRepository;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ReadingHistoryRepository;
import com.comichub.repository.UserRepository;
import com.comichub.service.ReadingHistoryService;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReadingHistoryServiceTest {

    @Mock
    private ReadingHistoryRepository readingHistoryRepository;
    @Mock
    private ChapterRepository chapterRepository;
    @Mock
    private ChapterPageRepository chapterPageRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReadingHistoryService readingHistoryService;

    @BeforeEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void userCanSaveProgressForPublishedChapter() {
        User user = user(7L, "reader");
        Chapter chapter = chapter(21L, "PUBLISHED", "PUBLISHED");
        setAuthentication("reader", "USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));
        when(chapterPageRepository.existsByChapter_IdAndPageNumber(21L, 3)).thenReturn(true);
        when(readingHistoryRepository.findByUser_IdAndComic_Id(7L, 12L))
                .thenReturn(Optional.empty());
        when(readingHistoryRepository.save(any(ReadingHistory.class)))
                .thenAnswer(invocation -> {
                    ReadingHistory history = invocation.getArgument(0);
                    history.setId(5L);
                    return history;
                });

        var result = readingHistoryService.saveProgress(
                new ReadingHistoryProgressRequest(21L, 3));

        assertEquals(5L, result.id());
        assertEquals(12L, result.comicId());
        assertEquals(21L, result.chapterId());
        assertEquals(3, result.lastPageNumber());
        assertEquals(5, result.pageCount());
        assertNotNull(result.readAt());
        verify(readingHistoryRepository).save(any(ReadingHistory.class));
    }

    @Test
    void authorUpdatesExistingProgressForTheSameComic() {
        User user = user(7L, "author");
        Chapter chapter = chapter(21L, "PUBLISHED", "PUBLISHED");
        ReadingHistory existing = new ReadingHistory();
        existing.setId(5L);
        setAuthentication("author", "AUTHOR");
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(user));
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));
        when(chapterPageRepository.existsByChapter_IdAndPageNumber(21L, 2)).thenReturn(true);
        when(readingHistoryRepository.findByUser_IdAndComic_Id(7L, 12L))
                .thenReturn(Optional.of(existing));
        when(readingHistoryRepository.save(existing)).thenReturn(existing);

        var result = readingHistoryService.saveProgress(
                new ReadingHistoryProgressRequest(21L, 2));

        assertEquals(5L, result.id());
        assertEquals(2, result.lastPageNumber());
        assertEquals(21L, result.chapterId());
        assertEquals(12L, existing.getComic().getId());
        verify(readingHistoryRepository).save(existing);
    }

    @Test
    void cannotSaveProgressForUnpublishedChapter() {
        User user = user(7L, "reader");
        Chapter chapter = chapter(21L, "PENDING", "PUBLISHED");
        setAuthentication("reader", "USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));

        assertThrows(ResourceNotFoundException.class,
                () -> readingHistoryService.saveProgress(
                        new ReadingHistoryProgressRequest(21L, 1)));
        verify(readingHistoryRepository, never()).save(any(ReadingHistory.class));
    }

    @Test
    void cannotSaveProgressForPageThatDoesNotExistInChapter() {
        User user = user(7L, "reader");
        Chapter chapter = chapter(21L, "PUBLISHED", "PUBLISHED");
        setAuthentication("reader", "USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));
        when(chapterPageRepository.existsByChapter_IdAndPageNumber(21L, 6)).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> readingHistoryService.saveProgress(
                        new ReadingHistoryProgressRequest(21L, 6)));
        verify(readingHistoryRepository, never()).save(any(ReadingHistory.class));
    }

    @Test
    void listsOnlyTheCurrentUsersHistoryForPublicContent() {
        User user = user(7L, "reader");
        ReadingHistory history = history(5L, user, chapter(21L, "PUBLISHED", "PUBLISHED"));
        ReadingHistory hiddenHistory = history(
                6L, user, chapter(22L, "PENDING", "PUBLISHED"));
        setAuthentication("reader", "USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(readingHistoryRepository.findByUser_IdOrderByReadAtDesc(7L))
                .thenReturn(List.of(history, hiddenHistory));

        var result = readingHistoryService.getHistory();

        assertEquals(1, result.size());
        assertEquals(5L, result.get(0).id());
        assertEquals(12L, result.get(0).comicId());
        verify(readingHistoryRepository).findByUser_IdOrderByReadAtDesc(7L);
    }

    @Test
    void cannotDeleteAnotherUsersHistory() {
        User user = user(7L, "reader");
        setAuthentication("reader", "USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(readingHistoryRepository.findByIdAndUser_Id(5L, 7L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> readingHistoryService.deleteHistory(5L));
        verify(readingHistoryRepository, never()).delete(any(ReadingHistory.class));
    }

    @Test
    void moderatorCannotUseReaderHistory() {
        setAuthentication("moderator", "MODERATOR");

        assertThrows(AccessDeniedException.class, readingHistoryService::getHistory);
        verify(readingHistoryRepository, never()).findByUser_IdOrderByReadAtDesc(any());
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private Chapter chapter(Long id, String status, String comicStatus) {
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setTitle("Comic title");
        comic.setSlug("comic-title");
        comic.setCoverUrl("/cover.jpg");
        comic.setModerationStatus(comicStatus);
        comic.setIsDeleted(false);

        Chapter chapter = new Chapter();
        chapter.setId(id);
        chapter.setComic(comic);
        chapter.setChapterNumber(BigDecimal.ONE);
        chapter.setTitle("Chapter title");
        chapter.setStatus(status);
        chapter.setPageCount(5);
        chapter.setIsDeleted(false);
        return chapter;
    }

    private ReadingHistory history(Long id, User user, Chapter chapter) {
        ReadingHistory history = new ReadingHistory();
        history.setId(id);
        history.setUser(user);
        history.setComic(chapter.getComic());
        history.setChapter(chapter);
        history.setLastPageNumber(2);
        history.setReadAt(LocalDateTime.now());
        return history;
    }

    private void setAuthentication(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
}
