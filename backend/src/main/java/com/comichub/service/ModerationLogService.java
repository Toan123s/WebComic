package com.comichub.service;

import com.comichub.dto.admin.ModerationLogResponse;
import com.comichub.dto.admin.ModerationLogPageResponse;
import com.comichub.entity.ModerationLog;
import com.comichub.repository.ModerationLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class ModerationLogService {

    private static final Set<String> ALLOWED_ACTIONS =
            Set.of("APPROVE", "REJECT", "PUBLISH");

    private final ModerationLogRepository moderationLogRepository;

    public ModerationLogService(ModerationLogRepository moderationLogRepository) {
        this.moderationLogRepository = moderationLogRepository;
    }

    public ModerationLogPageResponse getLogs(
            Long comicId, Long chapterId, Long moderatorId, String action, int page, int size) {
        requireAdmin();
        validateOptionalId(comicId, "comicId");
        validateOptionalId(chapterId, "chapterId");
        validateOptionalId(moderatorId, "moderatorId");
        if (page < 0) {
            throw new IllegalArgumentException("page không được nhỏ hơn 0");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size phải nằm trong khoảng 1 đến 100");
        }

        String normalizedAction = action == null || action.isBlank()
                ? null
                : action.trim().toUpperCase(Locale.ROOT);
        if (normalizedAction != null && !ALLOWED_ACTIONS.contains(normalizedAction)) {
            throw new IllegalArgumentException("action phải là APPROVE, REJECT hoặc PUBLISH");
        }

        Page<ModerationLog> logs = moderationLogRepository.searchLogs(
                comicId,
                chapterId,
                moderatorId,
                normalizedAction,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return new ModerationLogPageResponse(
                logs.getContent().stream().map(this::toResponse).toList(),
                logs.getNumber(),
                logs.getSize(),
                logs.getTotalElements(),
                logs.getTotalPages());
    }

    private ModerationLogResponse toResponse(ModerationLog log) {
        return new ModerationLogResponse(
                log.getId(),
                log.getComic().getId(),
                log.getComic().getTitle(),
                log.getChapter() == null ? null : log.getChapter().getId(),
                log.getChapter() == null ? null : log.getChapter().getTitle(),
                log.getModerator().getId(),
                log.getModerator().getUsername(),
                log.getAction(),
                log.getNote(),
                log.getCreatedAt());
    }

    private void validateOptionalId(Long id, String name) {
        if (id != null && id <= 0) {
            throw new IllegalArgumentException(name + " phải là số nguyên dương");
        }
    }

    private void requireAdmin() {
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!isAdmin) {
            throw new AccessDeniedException("Chỉ ADMIN mới được xem moderation logs");
        }
    }
}
