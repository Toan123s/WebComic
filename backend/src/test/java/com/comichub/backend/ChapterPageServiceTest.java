package com.comichub.backend;

import com.comichub.entity.Chapter;
import com.comichub.entity.ChapterPage;
import com.comichub.entity.Comic;
import com.comichub.repository.ChapterPageRepository;
import com.comichub.service.ChapterPageService;
import com.comichub.service.ChapterService;
import com.comichub.service.FileStorageService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.unit.DataSize;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class ChapterPageServiceTest {

    @Mock
    private ChapterService chapterService;
    @Mock
    private ChapterPageRepository chapterPageRepository;

    @InjectMocks
    private ChapterPageService chapterPageService;

    @TempDir
    Path uploadDirectory;

    @AfterEach
    void clearTransactionSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void uploadedImagesAppendSequentialPageNumbersInRequestOrder() throws Exception {
        FileStorageService fileStorageService = new FileStorageService(
                uploadDirectory.toString(), DataSize.ofMegabytes(10));
        chapterPageService = new ChapterPageService(
                chapterService, chapterPageRepository, fileStorageService);

        Chapter chapter = new Chapter();
        chapter.setId(21L);
        Comic comic = new Comic();
        comic.setId(12L);
        chapter.setComic(comic);
        ChapterPage first = page(chapter, 1);
        ChapterPage second = page(chapter, 2);
        when(chapterService.getEditableChapter(21L)).thenReturn(chapter);
        when(chapterPageRepository.findByChapter_IdOrderByPageNumberAsc(21L))
                .thenReturn(List.of(first, second));
        when(chapterPageRepository.saveAllAndFlush(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));
        TransactionSynchronizationManager.initSynchronization();

        byte[] image = createPng();
        var result = chapterPageService.uploadPages(21L, List.of(
                new MockMultipartFile("files", "first.png", "image/png", image),
                new MockMultipartFile("files", "second.png", "image/png", image)));

        assertEquals(List.of(3, 4), result.stream().map(item -> item.pageNumber()).toList());
        assertEquals(4, chapter.getPageCount());
        verify(chapterPageRepository).saveAllAndFlush(anyList());
        for (TransactionSynchronization synchronization
                : TransactionSynchronizationManager.getSynchronizations()) {
            synchronization.afterCompletion(TransactionSynchronization.STATUS_COMMITTED);
        }
    }

    @Test
    void failedBatchUploadRemovesFilesWrittenEarlierInTheBatch() throws Exception {
        FileStorageService fileStorageService = new FileStorageService(
                uploadDirectory.toString(), DataSize.ofMegabytes(10));
        chapterPageService = new ChapterPageService(
                chapterService, chapterPageRepository, fileStorageService);
        Chapter chapter = new Chapter();
        chapter.setId(21L);
        Comic comic = new Comic();
        comic.setId(12L);
        chapter.setComic(comic);
        when(chapterService.getEditableChapter(21L)).thenReturn(chapter);
        when(chapterPageRepository.findByChapter_IdOrderByPageNumberAsc(21L))
                .thenReturn(List.of());
        TransactionSynchronizationManager.initSynchronization();

        assertThrows(IllegalArgumentException.class, () -> chapterPageService.uploadPages(
                21L,
                List.of(
                        new MockMultipartFile("files", "valid.png", "image/png", createPng()),
                        new MockMultipartFile(
                                "files", "invalid.png", "image/png", "not an image".getBytes()))));

        for (TransactionSynchronization synchronization
                : TransactionSynchronizationManager.getSynchronizations()) {
            synchronization.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);
        }
        Path chapterDirectory = uploadDirectory.resolve("chapters").resolve("12").resolve("21");
        try (var files = java.nio.file.Files.list(chapterDirectory)) {
            assertFalse(files.findAny().isPresent());
        }
    }

    @Test
    void databaseFailureAfterWritingBatchRemovesAllUploadedFiles() throws Exception {
        FileStorageService fileStorageService = new FileStorageService(
                uploadDirectory.toString(), DataSize.ofMegabytes(10));
        chapterPageService = new ChapterPageService(
                chapterService, chapterPageRepository, fileStorageService);
        Chapter chapter = new Chapter();
        chapter.setId(21L);
        Comic comic = new Comic();
        comic.setId(12L);
        chapter.setComic(comic);
        when(chapterService.getEditableChapter(21L)).thenReturn(chapter);
        when(chapterPageRepository.findByChapter_IdOrderByPageNumberAsc(21L))
                .thenReturn(List.of());
        doThrow(new DataIntegrityViolationException("test persistence failure"))
                .when(chapterPageRepository).saveAllAndFlush(anyList());
        TransactionSynchronizationManager.initSynchronization();

        assertThrows(DataIntegrityViolationException.class,
                () -> chapterPageService.uploadPages(21L, List.of(
                        new MockMultipartFile("files", "first.png", "image/png", createPng()),
                        new MockMultipartFile("files", "second.png", "image/png", createPng()))));

        for (TransactionSynchronization synchronization
                : TransactionSynchronizationManager.getSynchronizations()) {
            synchronization.afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);
        }
        Path chapterDirectory = uploadDirectory.resolve("chapters").resolve("12").resolve("21");
        try (var files = java.nio.file.Files.list(chapterDirectory)) {
            assertFalse(files.findAny().isPresent());
        }
    }

    @Test
    void uploadRejectsEmptyBatchAndDoesNotPersistPages() {
        chapterPageService = new ChapterPageService(
                chapterService, chapterPageRepository,
                new FileStorageService(uploadDirectory.toString(), DataSize.ofMegabytes(10)));
        Chapter chapter = new Chapter();
        chapter.setId(21L);
        when(chapterService.getEditableChapter(21L)).thenReturn(chapter);

        assertThrows(IllegalArgumentException.class,
                () -> chapterPageService.uploadPages(21L, List.of()));
        verify(chapterPageRepository, never()).saveAllAndFlush(anyList());
    }

    @Test
    void nonOwnerCannotUploadPages() throws Exception {
        FileStorageService fileStorageService = mock(FileStorageService.class);
        chapterPageService = new ChapterPageService(
                chapterService, chapterPageRepository, fileStorageService);
        doThrow(new AccessDeniedException("forbidden"))
                .when(chapterService).getEditableChapter(21L);

        assertThrows(AccessDeniedException.class,
                () -> chapterPageService.uploadPages(21L, List.of(
                        new MockMultipartFile("files", "page.png", "image/png", createPng()))));
        verify(chapterPageRepository, never())
                .findByChapter_IdOrderByPageNumberAsc(21L);
        verify(fileStorageService, never()).storeChapterPage(any(), any(), any());
    }

    @Test
    void deletingPageRemovesFileOnlyAfterDatabaseCommit() throws Exception {
        FileStorageService fileStorageService = new FileStorageService(
                uploadDirectory.toString(), DataSize.ofMegabytes(10));
        chapterPageService = new ChapterPageService(
                chapterService, chapterPageRepository, fileStorageService);
        Chapter chapter = new Chapter();
        chapter.setId(21L);
        Comic comic = new Comic();
        comic.setId(12L);
        chapter.setComic(comic);
        var stored = fileStorageService.storeChapterPage(
                new MockMultipartFile("files", "page.png", "image/png", createPng()),
                12L, 21L);
        ChapterPage page = page(chapter, 1);
        page.setId(41L);
        page.setImageUrl(stored.relativePath());
        when(chapterPageRepository.findWithDetailsById(41L))
                .thenReturn(java.util.Optional.of(page));
        when(chapterService.getEditableChapter(21L)).thenReturn(chapter);
        when(chapterPageRepository.findByChapter_IdOrderByPageNumberAsc(21L))
                .thenReturn(List.of(page));
        TransactionSynchronizationManager.initSynchronization();

        chapterPageService.deletePage(41L);

        Path storedFile = fileStorageService.resolveStoredFile(stored.relativePath());
        assertTrue(java.nio.file.Files.exists(storedFile));
        for (TransactionSynchronization synchronization
                : TransactionSynchronizationManager.getSynchronizations()) {
            synchronization.afterCompletion(TransactionSynchronization.STATUS_COMMITTED);
        }
        assertFalse(java.nio.file.Files.exists(storedFile));
    }

    private ChapterPage page(Chapter chapter, int number) {
        ChapterPage page = new ChapterPage();
        page.setChapter(chapter);
        page.setPageNumber(number);
        page.setImageUrl("existing-" + number + ".png");
        return page;
    }

    private byte[] createPng() throws Exception {
        BufferedImage image = new BufferedImage(1, 1, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }
}
