package com.comichub.backend;

import com.comichub.dto.comic.ComicCreateRequest;
import com.comichub.dto.comic.ComicSummaryResponse;
import com.comichub.dto.comic.ComicUpdateRequest;
import com.comichub.entity.Comic;
import com.comichub.entity.ComicRevision;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.mapper.ComicMapper;
import com.comichub.mapper.ComicRevisionMapper;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.ComicRevisionRepository;
import com.comichub.repository.ModerationLogRepository;
import com.comichub.repository.UserRepository;
import com.comichub.service.ComicService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComicServiceTest {

    @Mock
    private ComicRepository comicRepository;
    @Mock
    private ComicRevisionRepository comicRevisionRepository;
    @Mock
    private ModerationLogRepository moderationLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ComicMapper comicMapper;
    @Mock
    private ComicRevisionMapper comicRevisionMapper;

    @InjectMocks
    private ComicService comicService;

    private User author;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setId(7L);
        author.setUsername("author");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "author",
                        "token",
                        java.util.List.of(new SimpleGrantedAuthority("ROLE_AUTHOR"))));
        lenient().when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createComicStartsAsDraftAndGeneratesStableSlug() {
        when(comicRepository.existsBySlug(anyString())).thenReturn(false);
        when(comicRepository.save(any(Comic.class))).thenAnswer(invocation -> invocation.getArgument(0));

        comicService.createComic(new ComicCreateRequest("Truyện đầu tiên", null, null, null));

        ArgumentCaptor<Comic> savedComic = ArgumentCaptor.forClass(Comic.class);
        verify(comicRepository).save(savedComic.capture());
        assertEquals("DRAFT", savedComic.getValue().getModerationStatus());
        assertEquals("truyen-dau-tien", savedComic.getValue().getSlug());
        assertEquals("ONGOING", savedComic.getValue().getPublicationStatus());
    }

    @Test
    void editingPublishedComicCreatesPendingRevisionWithoutChangingPublicVersion() {
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setTitle("Public title");
        comic.setSlug("public-title");
        comic.setModerationStatus("PUBLISHED");
        comic.setPublicationStatus("ONGOING");
        comic.setIsDeleted(false);
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(comicRevisionRepository.existsByComic_IdAndStatus(12L, "PENDING")).thenReturn(false);
        when(comicRevisionRepository.save(any(ComicRevision.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        comicService.updateComic(12L, new ComicUpdateRequest("Revised title", null, null, null));

        ArgumentCaptor<ComicRevision> revision = ArgumentCaptor.forClass(ComicRevision.class);
        verify(comicRevisionRepository).save(revision.capture());
        assertEquals("Revised title", revision.getValue().getTitle());
        assertEquals("PENDING", revision.getValue().getStatus());
        assertEquals("Public title", comic.getTitle());
        assertEquals("public-title", comic.getSlug());
    }

    @Test
    void authorCannotEditAnotherAuthorsComic() {
        User otherAuthor = new User();
        otherAuthor.setId(8L);
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(otherAuthor);
        comic.setModerationStatus("DRAFT");
        comic.setIsDeleted(false);
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));

        assertThrows(AccessDeniedException.class,
                () -> comicService.updateComic(
                        12L, new ComicUpdateRequest("Not mine", null, null, null)));
        verify(comicRepository, never()).save(any(Comic.class));
    }

    @Test
    void editingPublishedComicIsRejectedWhileRevisionIsPending() {
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PUBLISHED");
        comic.setIsDeleted(false);
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(comicRevisionRepository.existsByComic_IdAndStatus(12L, "PENDING")).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> comicService.updateComic(
                        12L, new ComicUpdateRequest("Another title", null, null, null)));

        verify(comicRevisionRepository, never()).save(any(ComicRevision.class));
    }

    @Test
    void approvingPublishedRevisionAppliesSnapshotAndKeepsSlug() {
        User moderator = new User();
        moderator.setId(9L);
        moderator.setUsername("moderator");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "moderator",
                        "token",
                        java.util.List.of(new SimpleGrantedAuthority("ROLE_MODERATOR"))));
        when(userRepository.findByUsername("moderator")).thenReturn(Optional.of(moderator));

        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setTitle("Old title");
        comic.setSlug("old-title");
        comic.setModerationStatus("PUBLISHED");
        comic.setPublicationStatus("ONGOING");
        comic.setIsDeleted(false);

        ComicRevision revision = new ComicRevision();
        revision.setId(31L);
        revision.setComic(comic);
        revision.setSubmittedBy(author);
        revision.setTitle("New title");
        revision.setDescription("Revised description");
        revision.setCoverUrl("new-cover.png");
        revision.setPublicationStatus("COMPLETED");
        revision.setStatus("PENDING");
        when(comicRevisionRepository.findWithDetailsById(31L)).thenReturn(Optional.of(revision));
        when(comicRepository.save(any(Comic.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(comicRevisionRepository.save(any(ComicRevision.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        comicService.approveRevision(31L);

        assertEquals("New title", comic.getTitle());
        assertEquals("old-title", comic.getSlug());
        assertEquals("Revised description", comic.getDescription());
        assertEquals("COMPLETED", comic.getPublicationStatus());
        assertEquals("APPROVED", revision.getStatus());
        verify(moderationLogRepository).save(any());
    }

    @Test
    void authorWithModeratorRoleCannotApproveOwnComic() {
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PENDING");
        comic.setIsDeleted(false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "author",
                        "token",
                        List.of(
                                new SimpleGrantedAuthority("ROLE_AUTHOR"),
                                new SimpleGrantedAuthority("ROLE_MODERATOR"))));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));

        assertThrows(AccessDeniedException.class, () -> comicService.approveComic(12L));
        verify(comicRepository, never()).save(any(Comic.class));
    }

    @Test
    void authorWithModeratorRoleCannotRejectOwnComic() {
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PENDING");
        comic.setIsDeleted(false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "author",
                        "token",
                        List.of(
                                new SimpleGrantedAuthority("ROLE_AUTHOR"),
                                new SimpleGrantedAuthority("ROLE_MODERATOR"))));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));

        assertThrows(AccessDeniedException.class,
                () -> comicService.rejectComic(12L, "rejected"));
        verify(comicRepository, never()).save(any(Comic.class));
    }

    @Test
    void authorWithModeratorRoleCannotApproveOrRejectOwnRevision() {
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PUBLISHED");
        comic.setIsDeleted(false);
        ComicRevision revision = new ComicRevision();
        revision.setId(31L);
        revision.setComic(comic);
        revision.setSubmittedBy(author);
        revision.setStatus("PENDING");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "author",
                        "token",
                        List.of(
                                new SimpleGrantedAuthority("ROLE_AUTHOR"),
                                new SimpleGrantedAuthority("ROLE_MODERATOR"))));
        when(comicRevisionRepository.findWithDetailsById(31L))
                .thenReturn(Optional.of(revision));
        when(userRepository.findByUsername("author")).thenReturn(Optional.of(author));

        assertThrows(AccessDeniedException.class,
                () -> comicService.approveRevision(31L));
        assertThrows(AccessDeniedException.class,
                () -> comicService.rejectRevision(31L, "rejected"));
        verify(comicRepository, never()).save(any(Comic.class));
        verify(comicRevisionRepository, never()).save(any(ComicRevision.class));
    }

    @Test
    void moderatorApprovalRequiresAdminPublish() {
        User moderator = new User();
        moderator.setId(9L);
        moderator.setUsername("moderator");
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PENDING");
        comic.setIsDeleted(false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "moderator",
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_MODERATOR"))));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(userRepository.findByUsername("moderator")).thenReturn(Optional.of(moderator));
        when(comicRepository.save(any(Comic.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        comicService.approveComic(12L);

        assertEquals("APPROVED", comic.getModerationStatus());
        assertNull(comic.getPublishedAt());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin",
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        User admin = new User();
        admin.setId(1L);
        admin.setUsername("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
        comicService.publishComic(12L);

        assertEquals("PUBLISHED", comic.getModerationStatus());
        assertNotNull(comic.getPublishedAt());
        verify(moderationLogRepository, times(2)).save(any());
    }

    @Test
    void authorCannotPublishApprovedComic() {
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("APPROVED");
        comic.setIsDeleted(false);

        assertThrows(AccessDeniedException.class, () -> comicService.publishComic(12L));
        verify(comicRepository, never()).save(any(Comic.class));
    }

    @Test
    void adminCannotSkipComicApproval() {
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PENDING");
        comic.setIsDeleted(false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "admin",
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));

        assertThrows(DuplicateResourceException.class,
                () -> comicService.publishComic(12L));
        verify(comicRepository, never()).save(any(Comic.class));
    }

    @Test
    void publicReaderCannotRetrieveSoftDeletedComic() {
        Comic comic = new Comic();
        comic.setId(12L);
        comic.setAuthor(author);
        comic.setModerationStatus("PUBLISHED");
        comic.setIsDeleted(true);
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        SecurityContextHolder.clearContext();

        assertThrows(ResourceNotFoundException.class, () -> comicService.getComicById(12L));
    }

    @Test
    void publicComicSearchNormalizesFiltersAndReturnsPagination() {
        Comic comic = new Comic();
        ComicSummaryResponse summary = new ComicSummaryResponse(
                12L, "Dragon", "dragon", null, "Author", "ONGOING",
                java.math.BigDecimal.ZERO, 0, 0L);
        when(comicRepository.searchPublished(
                eq("PUBLISHED"),
                eq("%dragon%"),
                eq(4),
                eq("ONGOING"),
                any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(comic), PageRequest.of(0, 10), 1));
        when(comicMapper.toSummaryResponse(comic)).thenReturn(summary);

        var result = comicService.searchPublicComics(" Dragon ", 4, "ongoing", 0, 10);

        assertEquals(List.of(summary), result.content());
        assertEquals(0, result.page());
        assertEquals(10, result.size());
        assertEquals(1, result.totalElements());
    }

    @Test
    void publicComicSearchRejectsInvalidPageSize() {
        assertThrows(IllegalArgumentException.class,
                () -> comicService.searchPublicComics(null, null, null, 0, 101));
        verify(comicRepository, never()).searchPublished(
                anyString(), isNull(), isNull(), isNull(), any(Pageable.class));
    }
}
