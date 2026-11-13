package com.comichub.controller;

import com.comichub.dto.chapter.ChapterCreateRequest;
import com.comichub.dto.chapter.ChapterResponse;
import com.comichub.dto.chapter.ChapterUpdateRequest;
import com.comichub.service.ChapterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ChapterController {

    private final ChapterService chapterService;

    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }

    @GetMapping("/api/comics/{comicId}/chapters")
    public ResponseEntity<List<ChapterResponse>> getChapters(
            @PathVariable Long comicId) {
        return ResponseEntity.ok(chapterService.getChapters(comicId));
    }

    @GetMapping("/api/chapters/{id}")
    public ResponseEntity<ChapterResponse> getChapter(@PathVariable Long id) {
        return ResponseEntity.ok(chapterService.getChapter(id));
    }

    @PostMapping("/api/comics/{comicId}/chapters")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ChapterResponse> createChapter(
            @PathVariable Long comicId,
            @Valid @RequestBody ChapterCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chapterService.createChapter(comicId, request));
    }

    @PatchMapping("/api/chapters/{id}")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ChapterResponse> updateChapter(
            @PathVariable Long id,
            @Valid @RequestBody ChapterUpdateRequest request) {
        return ResponseEntity.ok(chapterService.updateChapter(id, request));
    }

    @PostMapping("/api/chapters/{id}/submit")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ChapterResponse> submitForReview(@PathVariable Long id) {
        return ResponseEntity.ok(chapterService.submitForReview(id));
    }

    @PostMapping("/api/chapters/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ChapterResponse> publishChapter(@PathVariable Long id) {
        return ResponseEntity.ok(chapterService.publishChapter(id));
    }

    @DeleteMapping("/api/chapters/{id}")
    @PreAuthorize("hasRole('AUTHOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteChapter(@PathVariable Long id) {
        chapterService.deleteChapter(id);
        return ResponseEntity.noContent().build();
    }
}

