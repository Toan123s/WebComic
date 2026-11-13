package com.comichub.service;

import com.comichub.dto.chapter.ChapterPageResponse;
import com.comichub.entity.Chapter;
import com.comichub.entity.ChapterPage;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.ChapterPageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class ChapterPageService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChapterPageService.class);
    private final ChapterService chapterService;
    private final ChapterPageRepository chapterPageRepository;
    private final FileStorageService fileStorageService;

    public ChapterPageService(
            ChapterService chapterService,
            ChapterPageRepository chapterPageRepository,
            FileStorageService fileStorageService) {
        this.chapterService = chapterService;
        this.chapterPageRepository = chapterPageRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<ChapterPageResponse> getPages(Long chapterId) {
        chapterService.getAccessibleChapter(chapterId);
        return chapterPageRepository.findByChapter_IdOrderByPageNumberAsc(chapterId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<ChapterPageResponse> uploadPages(Long chapterId, List<MultipartFile> files) {
        Chapter chapter = chapterService.getEditableChapter(chapterId);
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Chọn ít nhất một ảnh để tải lên");
        }

        List<ChapterPage> existing = chapterPageRepository
                .findByChapter_IdOrderByPageNumberAsc(chapterId);
        int nextPageNumber = existing.stream()
                .map(ChapterPage::getPageNumber)
                .max(Comparator.naturalOrder())
                .orElse(0) + 1;
        List<String> uploadedPaths = new ArrayList<>();
        deleteUploadsOnRollback(uploadedPaths);
        List<ChapterPage> newPages = new ArrayList<>();

        for (int index = 0; index < files.size(); index++) {
            FileStorageService.StoredImage stored = fileStorageService.storeChapterPage(
                    files.get(index), chapter.getComic().getId(), chapter.getId());
            uploadedPaths.add(stored.relativePath());

            ChapterPage page = new ChapterPage();
            page.setChapter(chapter);
            page.setPageNumber(nextPageNumber + index);
            page.setImageUrl(stored.relativePath());
            page.setWidth(stored.width());
            page.setHeight(stored.height());
            page.setFileSize(stored.fileSize());
            newPages.add(page);
        }

        chapter.setPageCount(existing.size() + newPages.size());
        List<ChapterPage> savedPages = chapterPageRepository.saveAllAndFlush(newPages);
        return savedPages.stream().map(this::toResponse).toList();
    }

    public ImageFile getImage(Long pageId) {
        ChapterPage page = findPage(pageId);
        chapterService.getAccessibleChapter(page.getChapter().getId());
        Path path = fileStorageService.resolveStoredFile(page.getImageUrl());
        return new ImageFile(path, fileStorageService.contentType(page.getImageUrl()));
    }

    @Transactional
    public void deletePage(Long pageId) {
        ChapterPage page = findPage(pageId);
        Chapter chapter = chapterService.getEditableChapter(page.getChapter().getId());
        if (!Objects.equals(chapter.getId(), page.getChapter().getId())) {
            throw new ResourceNotFoundException("Không tìm thấy trang truyện");
        }

        List<ChapterPage> remaining = new ArrayList<>(
                chapterPageRepository.findByChapter_IdOrderByPageNumberAsc(chapter.getId()));
        remaining.removeIf(item -> Objects.equals(item.getId(), pageId));
        String oldFile = page.getImageUrl();

        chapterPageRepository.delete(page);
        chapterPageRepository.flush();
        renumberPages(remaining);
        chapter.setPageCount(remaining.size());
        deleteFileAfterCommit(oldFile);
    }

    private void renumberPages(List<ChapterPage> pages) {
        if (pages.isEmpty()) {
            return;
        }
        int maximum = pages.stream()
                .map(ChapterPage::getPageNumber)
                .max(Comparator.naturalOrder())
                .orElse(0);
        int offset = maximum + pages.size() + 1;
        pages.forEach(page -> page.setPageNumber(page.getPageNumber() + offset));
        chapterPageRepository.saveAllAndFlush(pages);

        for (int index = 0; index < pages.size(); index++) {
            pages.get(index).setPageNumber(index + 1);
        }
        chapterPageRepository.saveAllAndFlush(pages);
    }

    private ChapterPage findPage(Long pageId) {
        if (pageId == null || pageId <= 0) {
            throw new IllegalArgumentException("ID trang phải là số nguyên dương");
        }
        return chapterPageRepository.findWithDetailsById(pageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy trang có ID: " + pageId));
    }

    private ChapterPageResponse toResponse(ChapterPage page) {
        return new ChapterPageResponse(
                page.getId(),
                page.getPageNumber(),
                "/api/chapter-pages/" + page.getId() + "/image",
                page.getWidth(),
                page.getHeight(),
                page.getFileSize());
    }

    private void deleteUploadsOnRollback(List<String> paths) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    paths.forEach(ChapterPageService.this::deleteFileAndLogFailure);
                }
            }
        });
    }

    private void deleteFileAfterCommit(String path) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED) {
                    deleteFileAndLogFailure(path);
                }
            }
        });
    }

    private void deleteFileAndLogFailure(String path) {
        try {
            fileStorageService.delete(path);
        } catch (RuntimeException exception) {
            LOGGER.error("Không thể dọn tệp trang truyện: {}", path, exception);
        }
    }

    public record ImageFile(Path path, String contentType) {
    }
}

