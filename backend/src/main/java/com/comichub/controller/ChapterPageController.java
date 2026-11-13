package com.comichub.controller;

import com.comichub.dto.chapter.ChapterPageResponse;
import com.comichub.service.ChapterPageService;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Validated
public class ChapterPageController {

    private final ChapterPageService chapterPageService;

    public ChapterPageController(ChapterPageService chapterPageService) {
        this.chapterPageService = chapterPageService;
    }

    @GetMapping("/api/chapters/{chapterId}/pages")
    public ResponseEntity<List<ChapterPageResponse>> getPages(
            @PathVariable Long chapterId) {
        return ResponseEntity.ok(chapterPageService.getPages(chapterId));
    }

    @PostMapping(
            value = "/api/chapters/{chapterId}/pages",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<List<ChapterPageResponse>> uploadPages(
            @PathVariable Long chapterId,
            @RequestParam("files") @NotEmpty List<MultipartFile> files) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chapterPageService.uploadPages(chapterId, files));
    }

    @DeleteMapping("/api/chapter-pages/{pageId}")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<Void> deletePage(@PathVariable Long pageId) {
        chapterPageService.deletePage(pageId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/chapter-pages/{pageId}/image")
    public ResponseEntity<Resource> getPageImage(@PathVariable Long pageId) {
        ChapterPageService.ImageFile image = chapterPageService.getImage(pageId);
        Resource resource = new FileSystemResource(image.path());
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .contentType(MediaType.parseMediaType(image.contentType()))
                .body(resource);
    }
}

