package com.comichub.backend;

import com.comichub.dto.admin.DashboardSummaryResponse;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.ChapterRevisionRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.ComicRevisionRepository;
import com.comichub.repository.CommentRepository;
import com.comichub.repository.ReportRepository;
import com.comichub.service.AdminDashboardService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminDashboardServiceTest {

    @Mock
    private ComicRepository comicRepository;
    @Mock
    private ComicRevisionRepository comicRevisionRepository;
    @Mock
    private ChapterRepository chapterRepository;
    @Mock
    private ChapterRevisionRepository chapterRevisionRepository;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private AdminDashboardService service;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void dashboardCountsAllPendingModerationQueuesForAdmin() {
        authenticate("ROLE_ADMIN");
        when(comicRepository.countByModerationStatusAndIsDeletedFalse("PENDING"))
                .thenReturn(1L);
        when(comicRevisionRepository.countByStatus("PENDING")).thenReturn(2L);
        when(chapterRepository.countByStatusAndIsDeletedFalse("PENDING")).thenReturn(3L);
        when(chapterRevisionRepository.countByStatus("PENDING")).thenReturn(4L);
        when(commentRepository.countByStatus("PENDING")).thenReturn(5L);
        when(reportRepository.countByStatus("OPEN")).thenReturn(6L);
        when(reportRepository.countByStatus("IN_PROGRESS")).thenReturn(7L);

        assertEquals(
                new DashboardSummaryResponse(1L, 2L, 3L, 4L, 5L, 6L, 7L),
                service.getSummary());
    }

    @Test
    void nonAdminCannotReadDashboardSummary() {
        authenticate("ROLE_MODERATOR");

        assertThrows(AccessDeniedException.class, service::getSummary);
    }

    private void authenticate(String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "staff",
                        "token",
                        List.of(new SimpleGrantedAuthority(role))));
    }
}
