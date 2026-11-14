package com.comichub.controller;

import com.comichub.dto.comment.CommentCreateRequest;
import com.comichub.dto.comment.CommentResponse;
import com.comichub.dto.comment.CommentUpdateRequest;
import com.comichub.service.CommentService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/comics/{comicId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(
            @PathVariable Long comicId,
            @RequestParam(required = false) Long chapterId) {
        return ResponseEntity.ok(commentService.getComments(comicId, chapterId));
    }

    @PostMapping("/comics/{comicId}/comments")
    @PreAuthorize("hasAnyRole('USER', 'AUTHOR')")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long comicId,
            @Valid @RequestBody CommentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.createComment(comicId, request));
    }

    @PatchMapping("/comments/{commentId}")
    @PreAuthorize("hasAnyRole('USER', 'AUTHOR')")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentUpdateRequest request) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasAnyRole('USER', 'AUTHOR')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}

