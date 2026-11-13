/**
 * DỰ ÁN: ComicHub
 * FILE: BookmarkController.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Điểm tiếp nhận HTTP cho chức năng Bookmark.
 * TRẠNG THÁI: ĐÃ CÓ ENDPOINT DANH SÁCH/THÊM/XÓA.
 * CÒN THIẾU: Tiếp tục kiểm thử regression khi thay đổi API.
 */

package com.comichub.controller;

import com.comichub.dto.bookmark.BookmarkRequest;
import com.comichub.dto.bookmark.BookmarkResponse;
import com.comichub.service.BookmarkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @GetMapping
    public ResponseEntity<List<BookmarkResponse>> getBookmarks() {
        return ResponseEntity.ok(bookmarkService.getBookmarks());
    }

    @PostMapping
    public ResponseEntity<BookmarkResponse> addBookmark(
            @Valid @RequestBody BookmarkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookmarkService.addBookmark(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeBookmark(@PathVariable Long id) {
        bookmarkService.removeBookmark(id);
        return ResponseEntity.noContent().build();
    }
}
