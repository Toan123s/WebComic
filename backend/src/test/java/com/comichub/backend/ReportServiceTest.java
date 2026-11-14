package com.comichub.backend;

import com.comichub.dto.report.ReportCreateRequest;
import com.comichub.dto.report.ReportUpdateRequest;
import com.comichub.entity.Comic;
import com.comichub.entity.Report;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.CommentRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.ReportRepository;
import com.comichub.repository.UserRepository;
import com.comichub.service.ReportService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private ComicRepository comicRepository;
    @Mock
    private ChapterRepository chapterRepository;
    @Mock
    private CommentRepository commentRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReportService reportService;

    @BeforeEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void reportCanOnlyBeCreatedForPublicContent() {
        User reporter = user(2L, "reader");
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setModerationStatus("PUBLISHED");
        comic.setIsDeleted(false);
        authenticate("reader", "ROLE_USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reporter));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(reportRepository.save(any(Report.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = reportService.createReport(
                new ReportCreateRequest("comic", 12L, "spam", "  Nội dung quảng cáo  "));

        assertEquals("COMIC", response.targetType());
        assertEquals("SPAM", response.reason());
        assertEquals("OPEN", response.status());
        assertEquals("Nội dung quảng cáo", response.description());
    }

    @Test
    void reportMustMoveThroughInProgressBeforeResolution() {
        User moderator = user(3L, "moderator");
        Report report = report(9L, user(2L, "reporter"), "OPEN");
        authenticate("moderator", "ROLE_MODERATOR");
        when(userRepository.findByUsername("moderator"))
                .thenReturn(Optional.of(moderator));
        when(reportRepository.findWithDetailsById(9L)).thenReturn(Optional.of(report));

        assertThrows(DuplicateResourceException.class,
                () -> reportService.updateReport(
                        9L, new ReportUpdateRequest("RESOLVED", "Đã xử lý")));
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void reportMovesFromOpenToInProgressThenResolved() {
        User moderator = user(3L, "moderator");
        Report report = report(9L, user(2L, "reporter"), "OPEN");
        authenticate("moderator", "ROLE_MODERATOR");
        when(userRepository.findByUsername("moderator"))
                .thenReturn(Optional.of(moderator));
        when(reportRepository.findWithDetailsById(9L)).thenReturn(Optional.of(report));
        when(reportRepository.save(report)).thenReturn(report);

        var inProgress = reportService.updateReport(
                9L, new ReportUpdateRequest("IN_PROGRESS", null));
        var resolved = reportService.updateReport(
                9L, new ReportUpdateRequest("RESOLVED", "Đã kiểm tra và xử lý"));

        assertEquals("IN_PROGRESS", inProgress.status());
        assertEquals("RESOLVED", resolved.status());
        assertEquals("Đã kiểm tra và xử lý", resolved.resolutionNote());
        assertEquals(3L, resolved.handledById());
    }

    @Test
    void moderatorCannotHandleTheirOwnReport() {
        User moderator = user(3L, "moderator");
        Report report = report(9L, moderator, "OPEN");
        authenticate("moderator", "ROLE_MODERATOR");
        when(userRepository.findByUsername("moderator"))
                .thenReturn(Optional.of(moderator));
        when(reportRepository.findWithDetailsById(9L)).thenReturn(Optional.of(report));

        assertThrows(AccessDeniedException.class,
                () -> reportService.updateReport(
                        9L, new ReportUpdateRequest("IN_PROGRESS", null)));
        verify(reportRepository, never()).save(any(Report.class));
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private Report report(Long id, User reporter, String status) {
        Report report = new Report();
        report.setId(id);
        report.setReporter(reporter);
        report.setStatus(status);
        report.setTargetType("COMIC");
        report.setTargetId(12L);
        report.setReason("SPAM");
        return report;
    }

    private void authenticate(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority(role))));
    }
}
