package com.comichub.controller;

import com.comichub.dto.chapter.ChapterPageResponse;
import com.comichub.dto.chapter.ChapterRevisionCreateRequest;
import com.comichub.dto.chapter.ChapterRevisionResponse;
import com.comichub.dto.chapter.ChapterRevisionUpdateRequest;
import com.comichub.service.ChapterRevisionService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@Validated
public class ChapterRevisionController {

    private final ChapterRevisionService chapterRevisionService;

    public ChapterRevisionController(ChapterRevisionService chapterRevisionService) {
        this.chapterRevisionService = chapterRevisionService;
    }

    @PostMapping("/api/chapters/{chapterId}/revisions")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ChapterRevisionResponse> createDraft(
            @PathVariable Long chapterId,
            @Valid @RequestBody(required = false) ChapterRevisionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chapterRevisionService.createDraft(chapterId, request));
    }

    @GetMapping("/api/chapters/{chapterId}/revisions")
    @PreAuthorize("hasAnyRole('AUTHOR', 'MODERATOR', 'ADMIN')")
    public ResponseEntity<List<ChapterRevisionResponse>> getRevisions(
            @PathVariable Long chapterId) {
        return ResponseEntity.ok(chapterRevisionService.getChapterRevisions(chapterId));
    }

    @PatchMapping("/api/chapter-revisions/{revisionId}")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ChapterRevisionResponse> updateDraft(
            @PathVariable Long revisionId,
            @Valid @RequestBody ChapterRevisionUpdateRequest request) {
        return ResponseEntity.ok(
                chapterRevisionService.updateDraft(revisionId, request));
    }

    @PostMapping("/api/chapter-revisions/{revisionId}/pages")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<List<ChapterPageResponse>> uploadPages(
            @PathVariable Long revisionId,
            @RequestParam("files") @NotEmpty List<MultipartFile> files) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chapterRevisionService.uploadPages(revisionId, files));
    }

    @DeleteMapping("/api/chapter-revision-pages/{pageId}")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<Void> deletePage(@PathVariable Long pageId) {
        chapterRevisionService.deleteDraftPage(pageId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/chapter-revisions/{revisionId}")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<Void> deleteDraft(@PathVariable Long revisionId) {
        chapterRevisionService.deleteDraft(revisionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/chapter-revisions/{revisionId}/submit")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ChapterRevisionResponse> submit(
            @PathVariable Long revisionId) {
        return ResponseEntity.ok(chapterRevisionService.submit(revisionId));
    }

    @GetMapping("/api/chapter-revision-pages/{pageId}/image")
    @PreAuthorize("hasAnyRole('AUTHOR', 'MODERATOR', 'ADMIN')")
    public ResponseEntity<Resource> getPageImage(@PathVariable Long pageId) {
        ChapterRevisionService.ImageFile image =
                chapterRevisionService.getRevisionPageImage(pageId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .contentType(MediaType.parseMediaType(image.contentType()))
                .body(new FileSystemResource(image.path()));
    }
}
