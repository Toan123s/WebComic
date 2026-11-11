/**
 * DỰ ÁN: ComicHub
 * FILE: ComicController.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Điểm tiếp nhận HTTP cho chức năng Comic.
 * TRẠNG THÁI: CHƯA TRIỂN KHAI — file khung, chưa có mã chức năng.
 * CÒN THIẾU: Cần bổ sung implementation theo API contract và kiểm thử; cập nhật trạng thái sau khi hoàn thành.
 * LƯU Ý: Khi triển khai: chốt endpoint/request/response/status theo API contract; validate input, gọi Service và kiểm tra quyền ở backend.
 */

package com.comichub.controller;

import com.comichub.dto.comic.ComicCreateRequest;
import com.comichub.dto.comic.ComicEditResponse;
import com.comichub.dto.comic.ComicResponse;
import com.comichub.dto.comic.ComicRevisionResponse;
import com.comichub.dto.comic.ComicSummaryResponse;
import com.comichub.dto.comic.ComicUpdateRequest;
import com.comichub.service.ComicService;
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
@RequestMapping("/api/comics")
public class ComicController {

    private final ComicService comicService;

    public ComicController(ComicService comicService) {
        this.comicService = comicService;
    }

    @GetMapping
    public ResponseEntity<List<ComicSummaryResponse>> getPublicComics() {
        return ResponseEntity.ok(comicService.getPublicComics());
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<List<ComicSummaryResponse>> getMyComics() {
        return ResponseEntity.ok(comicService.getMyComics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComicResponse> getComicById(@PathVariable Long id) {
        return ResponseEntity.ok(comicService.getComicById(id));
    }

    @GetMapping("/{id}/revisions")
    public ResponseEntity<List<ComicRevisionResponse>> getComicRevisions(
            @PathVariable Long id) {
        return ResponseEntity.ok(comicService.getComicRevisions(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ComicResponse> createComic(
            @Valid @RequestBody ComicCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(comicService.createComic(request));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ComicEditResponse> updateComic(
            @PathVariable Long id,
            @Valid @RequestBody ComicUpdateRequest request) {
        return ResponseEntity.ok(comicService.updateComic(id, request));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<ComicResponse> submitForReview(@PathVariable Long id) {
        return ResponseEntity.ok(comicService.submitForReview(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('AUTHOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteComic(@PathVariable Long id) {
        comicService.deleteComic(id);
        return ResponseEntity.noContent().build();
    }
}
