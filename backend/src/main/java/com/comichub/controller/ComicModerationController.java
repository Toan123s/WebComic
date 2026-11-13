package com.comichub.controller;

import com.comichub.dto.comic.ComicResponse;
import com.comichub.dto.comic.ComicRevisionResponse;
import com.comichub.dto.comic.ModerationDecisionRequest;
import com.comichub.dto.chapter.ChapterResponse;
import com.comichub.dto.chapter.ChapterRevisionResponse;
import com.comichub.service.ComicService;
import com.comichub.service.ChapterService;
import com.comichub.service.ChapterRevisionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/moderation")
@PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
public class ComicModerationController {

    private final ComicService comicService;
    private final ChapterService chapterService;
    private final ChapterRevisionService chapterRevisionService;

    public ComicModerationController(
            ComicService comicService,
            ChapterService chapterService,
            ChapterRevisionService chapterRevisionService) {
        this.comicService = comicService;
        this.chapterService = chapterService;
        this.chapterRevisionService = chapterRevisionService;
    }

    @GetMapping("/comics/pending")
    public ResponseEntity<List<ComicResponse>> getPendingComics() {
        return ResponseEntity.ok(comicService.getPendingComics());
    }

    @PostMapping("/comics/{id}/approve")
    public ResponseEntity<ComicResponse> approveComic(@PathVariable Long id) {
        return ResponseEntity.ok(comicService.approveComic(id));
    }

    @PostMapping("/comics/{id}/reject")
    public ResponseEntity<ComicResponse> rejectComic(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ModerationDecisionRequest request) {
        return ResponseEntity.ok(comicService.rejectComic(
                id, request == null ? null : request.note()));
    }

    @GetMapping("/comic-revisions/pending")
    public ResponseEntity<List<ComicRevisionResponse>> getPendingRevisions() {
        return ResponseEntity.ok(comicService.getPendingRevisions());
    }

    @PostMapping("/comic-revisions/{revisionId}/approve")
    public ResponseEntity<ComicRevisionResponse> approveRevision(
            @PathVariable Long revisionId) {
        return ResponseEntity.ok(comicService.approveRevision(revisionId));
    }

    @PostMapping("/comic-revisions/{revisionId}/reject")
    public ResponseEntity<ComicRevisionResponse> rejectRevision(
            @PathVariable Long revisionId,
            @Valid @RequestBody(required = false) ModerationDecisionRequest request) {
        return ResponseEntity.ok(comicService.rejectRevision(
                revisionId, request == null ? null : request.note()));
    }

    @GetMapping("/chapters/pending")
    public ResponseEntity<List<ChapterResponse>> getPendingChapters() {
        return ResponseEntity.ok(chapterService.getPendingChapters());
    }

    @PostMapping("/chapters/{chapterId}/approve")
    public ResponseEntity<ChapterResponse> approveChapter(@PathVariable Long chapterId) {
        return ResponseEntity.ok(chapterService.approveChapter(chapterId));
    }

    @PostMapping("/chapters/{chapterId}/reject")
    public ResponseEntity<ChapterResponse> rejectChapter(
            @PathVariable Long chapterId,
            @Valid @RequestBody(required = false) ModerationDecisionRequest request) {
        return ResponseEntity.ok(chapterService.rejectChapter(
                chapterId, request == null ? null : request.note()));
    }

    @GetMapping("/chapter-revisions/pending")
    public ResponseEntity<List<ChapterRevisionResponse>> getPendingChapterRevisions() {
        return ResponseEntity.ok(chapterRevisionService.getPendingRevisions());
    }

    @PostMapping("/chapter-revisions/{revisionId}/approve")
    public ResponseEntity<ChapterRevisionResponse> approveChapterRevision(
            @PathVariable Long revisionId) {
        return ResponseEntity.ok(chapterRevisionService.approve(revisionId));
    }

    @PostMapping("/chapter-revisions/{revisionId}/reject")
    public ResponseEntity<ChapterRevisionResponse> rejectChapterRevision(
            @PathVariable Long revisionId,
            @Valid @RequestBody(required = false) ModerationDecisionRequest request) {
        return ResponseEntity.ok(chapterRevisionService.reject(
                revisionId, request == null ? null : request.note()));
    }
}
