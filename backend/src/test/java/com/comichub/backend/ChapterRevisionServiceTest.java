package com.comichub.backend;

import com.comichub.dto.chapter.ChapterRevisionCreateRequest;
import com.comichub.entity.Chapter;
import com.comichub.entity.ChapterPage;
import com.comichub.entity.ChapterRevision;
import com.comichub.entity.ChapterRevisionPage;
import com.comichub.entity.Comic;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.repository.ChapterPageRepository;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ChapterRevisionPageRepository;
import com.comichub.repository.ChapterRevisionRepository;
import com.comichub.repository.ModerationLogRepository;
import com.comichub.repository.UserRepository;
import com.comichub.service.ChapterRevisionService;
import com.comichub.service.FileStorageService;
import org.junit.jupiter.api.io.TempDir;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.unit.DataSize;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChapterRevisionServiceTest {

    @Mock
    private ChapterRevisionRepository revisionRepository;
    @Mock
    private ChapterRevisionPageRepository revisionPageRepository;
    @Mock
    private ChapterRepository chapterRepository;
    @Mock
    private ChapterPageRepository chapterPageRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ModerationLogRepository moderationLogRepository;
    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private ChapterRevisionService chapterRevisionService;

    @TempDir
    Path uploadDirectory;

    private User author;
    private Comic comic;
    private Chapter chapter;

    @BeforeEach
    void setUp() {
        author = user(7L, "author");
        comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PUBLISHED");
        comic.setIsDeleted(false);
        chapter = new Chapter();
        chapter.setId(21L);
        chapter.setComic(comic);
        chapter.setChapterNumber(BigDecimal.ONE);
        chapter.setTitle("Old title");
        chapter.setStatus("PUBLISHED");
        chapter.setPageCount(1);
        chapter.setIsDeleted(false);
        setAuthentication("author", "AUTHOR");
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void createsDraftSnapshotWithoutChangingPublishedChapter() {
        setOwnerStubs();
        when(revisionRepository.existsByChapter_IdAndStatusIn(
                21L, List.of("DRAFT", "PENDING"))).thenReturn(false);
        when(chapterPageRepository.findByChapter_IdOrderByPageNumberAsc(21L))
                .thenReturn(List.of(chapterPage(1, "old/page-1.jpg")));
        when(revisionRepository.saveAndFlush(any(ChapterRevision.class)))
                .thenAnswer(invocation -> {
                    ChapterRevision revision = invocation.getArgument(0);
                    revision.setId(31L);
                    return revision;
                });
        when(revisionPageRepository.saveAllAndFlush(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = chapterRevisionService.createDraft(21L, null);

        assertEquals(31L, result.id());
        assertEquals("DRAFT", result.status());
        assertEquals(1, result.pages().size());
        assertEquals("PUBLISHED", chapter.getStatus());
        assertEquals("Old title", chapter.getTitle());
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void rejectsSecondActiveRevisionForChapter() {
        setOwnerStubs();
        when(revisionRepository.existsByChapter_IdAndStatusIn(
                21L, List.of("DRAFT", "PENDING"))).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> chapterRevisionService.createDraft(
                        21L, new ChapterRevisionCreateRequest(null, "New title")));
        verify(revisionRepository, never()).saveAndFlush(any(ChapterRevision.class));
    }

    @Test
    void moderatorApprovalAppliesRevisionAndKeepsChapterPublished() {
        User moderator = user(9L, "moderator");
        ChapterRevision revision = revision(31L, "PENDING", author);
        setAuthentication("moderator", "MODERATOR");
        when(revisionRepository.findWithDetailsById(31L))
                .thenReturn(Optional.of(revision));
        when(userRepository.findByUsername("moderator")).thenReturn(Optional.of(moderator));
        when(chapterRepository.existsByComic_IdAndChapterNumberAndIdNot(
                12L, new BigDecimal("2.0"), 21L)).thenReturn(false);
        when(revisionPageRepository.findByRevision_IdOrderByPageNumberAsc(31L))
                .thenReturn(List.of(revisionPage(31L, revision, 1, "old/page-1.jpg")));
        when(chapterPageRepository.findByChapter_IdOrderByPageNumberAsc(21L))
                .thenReturn(List.of(chapterPage(1, "old/page-1.jpg")));
        when(chapterRepository.save(any(Chapter.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(chapterPageRepository.saveAllAndFlush(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(revisionRepository.save(revision)).thenReturn(revision);

        var result = chapterRevisionService.approve(31L);

        assertEquals("APPROVED", result.status());
        assertEquals(new BigDecimal("2.0"), chapter.getChapterNumber());
        assertEquals("New title", chapter.getTitle());
        assertEquals("PUBLISHED", chapter.getStatus());
        verify(chapterPageRepository).deleteAll(anyList());
        verify(moderationLogRepository).save(any());
    }

    @Test
    void authorCannotApproveOwnChapterRevision() {
        ChapterRevision revision = revision(31L, "PENDING", author);
        setAuthentication("author", "MODERATOR");
        when(revisionRepository.findWithDetailsById(31L))
                .thenReturn(Optional.of(revision));
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));

        assertThrows(AccessDeniedException.class,
                () -> chapterRevisionService.approve(31L));
        verify(chapterRepository, never()).save(any(Chapter.class));
    }

    @Test
    void databaseFailureDuringRevisionUploadRemovesUploadedFiles() throws Exception {
        chapterRevisionService = new ChapterRevisionService(
                revisionRepository,
                revisionPageRepository,
                chapterRepository,
                chapterPageRepository,
                userRepository,
                moderationLogRepository,
                new FileStorageService(uploadDirectory.toString(), DataSize.ofMegabytes(10)));
        ChapterRevision revision = revision(31L, "DRAFT", author);
        when(revisionRepository.findWithDetailsById(31L)).thenReturn(Optional.of(revision));
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
        when(revisionPageRepository.findByRevision_IdOrderByPageNumberAsc(31L))
                .thenReturn(List.of());
        doThrow(new DataIntegrityViolationException("test persistence failure"))
                .when(revisionPageRepository).saveAllAndFlush(anyList());
        TransactionSynchronizationManager.initSynchronization();

        assertThrows(DataIntegrityViolationException.class,
                () -> chapterRevisionService.uploadPages(31L, List.of(
                        new MockMultipartFile("files", "first.png", "image/png", createPng()),
                        new MockMultipartFile("files", "second.png", "image/png", createPng()))));

        for (TransactionSynchronization synchronization
                : TransactionSynchronizationManager.getSynchronizations()) {
            synchronization.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);
        }
        Path chapterDirectory = uploadDirectory.resolve("chapters").resolve("12").resolve("21");
        try (var files = Files.list(chapterDirectory)) {
            org.junit.jupiter.api.Assertions.assertFalse(files.findAny().isPresent());
        }
    }

    private void setOwnerStubs() {
        when(chapterRepository.findWithDetailsById(21L)).thenReturn(Optional.of(chapter));
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
    }

    private ChapterRevision revision(Long id, String status, User submitter) {
        ChapterRevision revision = new ChapterRevision();
        revision.setId(id);
        revision.setChapter(chapter);
        revision.setSubmittedBy(submitter);
        revision.setChapterNumber(new BigDecimal("2.0"));
        revision.setTitle("New title");
        revision.setStatus(status);
        revision.setSubmittedAt(java.time.LocalDateTime.now());
        return revision;
    }

    private ChapterRevisionPage revisionPage(
            Long id, ChapterRevision revision, int number, String path) {
        ChapterRevisionPage page = new ChapterRevisionPage();
        page.setId(id);
        page.setRevision(revision);
        page.setPageNumber(number);
        page.setImageUrl(path);
        return page;
    }

    private ChapterPage chapterPage(int number, String path) {
        ChapterPage page = new ChapterPage();
        page.setId((long) number);
        page.setChapter(chapter);
        page.setPageNumber(number);
        page.setImageUrl(path);
        return page;
    }

    private byte[] createPng() throws Exception {
        BufferedImage image = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private void setAuthentication(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
}
