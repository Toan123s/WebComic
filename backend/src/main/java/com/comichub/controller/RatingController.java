/**
 * DỰ ÁN: ComicHub
 * FILE: RatingController.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Điểm tiếp nhận HTTP cho chức năng đánh giá truyện.
 * TRẠNG THÁI: ĐÃ CÓ ENDPOINT GET/PUT; CẦN ĐĂNG NHẬP (USER/AUTHOR).
 * CÒN THIẾU: Postman/test MVC.
 */

package com.comichub.controller;

import com.comichub.dto.rating.RatingRequest;
import com.comichub.dto.rating.RatingResponse;
import com.comichub.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comics/{comicId}/rating")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping
    public ResponseEntity<RatingResponse> getMyRating(@PathVariable Long comicId) {
        return ResponseEntity.ok(ratingService.getMyRating(comicId));
    }

    @PutMapping
    public ResponseEntity<RatingResponse> rateComic(
            @PathVariable Long comicId,
            @Valid @RequestBody RatingRequest request) {
        return ResponseEntity.ok(ratingService.rateComic(comicId, request));
    }
}