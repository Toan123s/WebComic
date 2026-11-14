package com.comichub.controller;

import com.comichub.dto.follow.FollowNotificationRequest;
import com.comichub.dto.follow.FollowPageResponse;
import com.comichub.dto.follow.FollowRequest;
import com.comichub.dto.follow.FollowResponse;
import com.comichub.service.FollowService;
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

@RestController
@RequestMapping("/api/follows")
@PreAuthorize("hasAnyRole('USER', 'AUTHOR')")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @GetMapping
    public ResponseEntity<FollowPageResponse> getFollows(
            @RequestParam(required = false) String targetType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(followService.getFollows(targetType, page, size));
    }

    @PostMapping
    public ResponseEntity<FollowResponse> createFollow(
            @Valid @RequestBody FollowRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(followService.createFollow(request));
    }

    @PatchMapping("/{followId}")
    public ResponseEntity<FollowResponse> updateNotifications(
            @PathVariable Long followId,
            @Valid @RequestBody FollowNotificationRequest request) {
        return ResponseEntity.ok(
                followService.updateNotifications(followId, request));
    }

    @DeleteMapping("/{followId}")
    public ResponseEntity<Void> deleteFollow(@PathVariable Long followId) {
        followService.deleteFollow(followId);
        return ResponseEntity.noContent().build();
    }
}
