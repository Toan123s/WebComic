package com.comichub.backend;

import com.comichub.dto.comic.ComicCreateRequest;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
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
}
