package com.comichub.controller;

import com.comichub.dto.admin.ModerationLogPageResponse;
import com.comichub.service.ModerationLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/moderation-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminModerationLogController {

    private final ModerationLogService moderationLogService;

    public AdminModerationLogController(ModerationLogService moderationLogService) {
        this.moderationLogService = moderationLogService;
    }

    @GetMapping
    public ResponseEntity<ModerationLogPageResponse> getLogs(
            @RequestParam(required = false) Long comicId,
            @RequestParam(required = false) Long chapterId,
            @RequestParam(required = false) Long moderatorId,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(moderationLogService.getLogs(
                comicId, chapterId, moderatorId, action, page, size));
    }
}
