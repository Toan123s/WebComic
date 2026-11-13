package com.comichub.backend;

import com.comichub.dto.chapter.ChapterCreateRequest;
import com.comichub.entity.Chapter;
import com.comichub.entity.Comic;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.repository.ChapterPageRepository;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.ModerationLogRepository;
import com.comichub.repository.UserRepository;
import com.comichub.service.ChapterService;
import com.comichub.service.FileStorageService;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChapterServiceTest {

    @Mock
    private ChapterRepository chapterRepository;
    @Mock
    private ChapterPageRepository chapterPageRepository;
    @Mock
    private ComicRepository comicRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ModerationLogRepository moderationLogRepository;
    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ChapterService chapterService;

    private User author;
    private Comic comic;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setId(7L);
        author.setUsername("author");
        comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PUBLISHED");
        comic.setIsDeleted(false);
        setAuthentication("author", "AUTHOR");
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createChapterStartsAsDraftForComicOwner() {
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
        when(chapterRepository.existsByComic_IdAndChapterNumber(
                12L, new BigDecimal("1.0"))).thenReturn(false);
        when(chapterRepository.save(any(Chapter.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = chapterService.createChapter(
                12L, new ChapterCreateRequest(new BigDecimal("1.0"), "  Tập đầu  "));

        assertEquals("DRAFT", result.status());
        assertEquals("Tập đầu", result.title());
        assertEquals(0, result.pageCount());
    }

    @Test
    void creatorCannotCreateChapterForAnotherAuthorsComic() {
        User otherAuthor = new User();
        otherAuthor.setId(8L);
        comic.setAuthor(otherAuthor);
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));

        assertThrows(AccessDeniedException.class,
                () -> chapterService.createChapter(
                        12L, new ChapterCreateRequest(new BigDecimal("1.0"), null)));
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void submitForReviewRequiresAtLeastOnePage() {
        Chapter chapter = chapter("DRAFT");
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));
        when(chapterPageRepository.countByChapter_Id(21L)).thenReturn(0);
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));

        assertThrows(IllegalArgumentException.class,
                () -> chapterService.submitForReview(21L));
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void moderatorApprovesThenAdminPublishesChapterAndWritesModerationLog() {
        User moderator = new User();
        moderator.setId(9L);
        moderator.setUsername("moderator");
        setAuthentication("moderator", "MODERATOR");
        when(userRepository.findByUsername("moderator")).thenReturn(Optional.of(moderator));
        Chapter chapter = chapter("PENDING");
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));
        when(chapterPageRepository.countByChapter_Id(21L)).thenReturn(2);
        when(chapterRepository.save(any(Chapter.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = chapterService.approveChapter(21L);

        assertEquals("APPROVED", result.status());
        assertEquals(2, result.pageCount());
        verify(moderationLogRepository).save(any());

        setAuthentication("admin", "ADMIN");
        User admin = new User();
        admin.setId(1L);
        admin.setUsername("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        result = chapterService.publishChapter(21L);

        assertEquals("PUBLISHED", result.status());
        verify(moderationLogRepository, times(2)).save(any());
    }

    @Test
    void authorCannotPublishApprovedChapter() {
        Chapter chapter = chapter("APPROVED");

        assertThrows(AccessDeniedException.class,
                () -> chapterService.publishChapter(21L));
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void adminCannotSkipChapterApproval() {
        Chapter chapter = chapter("PENDING");
        setAuthentication("admin", "ADMIN");
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));

        assertThrows(DuplicateResourceException.class,
                () -> chapterService.publishChapter(21L));
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void authorWithModeratorRoleCannotApproveOwnChapter() {
        setAuthentication("author", "MODERATOR");
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
        Chapter chapter = chapter("PENDING");
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));

        assertThrows(AccessDeniedException.class, () -> chapterService.approveChapter(21L));
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void authorWithModeratorRoleCannotRejectOwnChapter() {
        setAuthentication("author", "MODERATOR");
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
        Chapter chapter = chapter("PENDING");
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));

        assertThrows(AccessDeniedException.class,
                () -> chapterService.rejectChapter(21L, "rejected"));
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void rejectionRequiresModeratorReason() {
        setAuthentication("moderator", "MODERATOR");

        assertThrows(IllegalArgumentException.class,
                () -> chapterService.rejectChapter(21L, " "));
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    private Chapter chapter(String status) {
        Chapter chapter = new Chapter();
        chapter.setId(21L);
        chapter.setComic(comic);
        chapter.setChapterNumber(new BigDecimal("1.0"));
        chapter.setStatus(status);
        chapter.setPageCount(1);
        chapter.setIsDeleted(false);
        return chapter;
    }

    private void setAuthentication(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
}
