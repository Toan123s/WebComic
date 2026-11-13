package com.comichub.backend;

import com.comichub.entity.Chapter;
import com.comichub.entity.Comic;
import com.comichub.entity.ModerationLog;
import com.comichub.entity.User;
import com.comichub.repository.ModerationLogRepository;
import com.comichub.service.ModerationLogService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ModerationLogServiceTest {

    @Mock
    private ModerationLogRepository moderationLogRepository;

    @InjectMocks
    private ModerationLogService moderationLogService;

    @BeforeEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void adminCanFilterAndPageModerationLogs() {
        User moderator = new User();
        moderator.setId(9L);
        moderator.setUsername("moderator");
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setTitle("Comic");
        Chapter chapter = new Chapter();
        chapter.setId(21L);
        chapter.setTitle("Chapter");
        ModerationLog log = new ModerationLog();
        log.setId(4L);
        log.setComic(comic);
        log.setChapter(chapter);
        log.setModerator(moderator);
        log.setAction("PUBLISH");
        log.setCreatedAt(LocalDateTime.now());
        setAuthentication("admin", "ADMIN");
        when(moderationLogRepository.searchLogs(
                12L, 21L, 9L, "PUBLISH",
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))))
                .thenReturn(new PageImpl<>(List.of(log)));

        var result = moderationLogService.getLogs(
                12L, 21L, 9L, " publish ", 0, 10);

        assertEquals(1, result.totalElements());
        assertEquals("PUBLISH", result.content().get(0).action());
        assertEquals("moderator", result.content().get(0).moderatorUsername());
    }

    @Test
    void moderatorCannotReadAdminLogs() {
        setAuthentication("moderator", "MODERATOR");

        assertThrows(AccessDeniedException.class,
                () -> moderationLogService.getLogs(null, null, null, null, 0, 20));
        verify(moderationLogRepository, never())
                .searchLogs(null, null, null, null, PageRequest.of(0, 20));
    }

    @Test
    void rejectsUnknownActionFilter() {
        setAuthentication("admin", "ADMIN");

        assertThrows(IllegalArgumentException.class,
                () -> moderationLogService.getLogs(null, null, null, "DELETE", 0, 20));
        verify(moderationLogRepository, never())
                .searchLogs(null, null, null, "DELETE", PageRequest.of(0, 20));
    }

    private void setAuthentication(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
}
