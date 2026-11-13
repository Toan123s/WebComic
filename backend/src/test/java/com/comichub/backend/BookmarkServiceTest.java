package com.comichub.backend;

import com.comichub.dto.bookmark.BookmarkRequest;
import com.comichub.entity.Bookmark;
import com.comichub.entity.Comic;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.BookmarkRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.UserRepository;
import com.comichub.service.BookmarkService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
class BookmarkServiceTest {

    @Mock
    private BookmarkRepository bookmarkRepository;
    @Mock
    private ComicRepository comicRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookmarkService bookmarkService;

    @BeforeEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listsCurrentUsersBookmarksWithComicDetails() {
        User user = user(7L, "reader");
        Comic comic = comic(12L, "PUBLISHED");
        Bookmark bookmark = new Bookmark();
        bookmark.setId(3L);
        bookmark.setUser(user);
        bookmark.setComic(comic);
        setAuthentication("reader");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(bookmarkRepository.findByUser_IdOrderByCreatedAtDesc(7L))
                .thenReturn(List.of(bookmark));

        var result = bookmarkService.getBookmarks();

        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).id());
        assertEquals(12L, result.get(0).comicId());
        assertEquals("Published", result.get(0).title());
    }

    @Test
    void addsBookmarkForPublishedComic() {
        User user = user(7L, "reader");
        Comic comic = comic(12L, "PUBLISHED");
        setAuthentication("reader");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(bookmarkRepository.existsByUser_IdAndComic_Id(7L, 12L)).thenReturn(false);
        when(bookmarkRepository.save(any(Bookmark.class))).thenAnswer(invocation -> {
            Bookmark bookmark = invocation.getArgument(0);
            bookmark.setId(3L);
            return bookmark;
        });

        var result = bookmarkService.addBookmark(new BookmarkRequest(12L));

        assertEquals(3L, result.id());
        assertEquals(12L, result.comicId());
        assertEquals("Published", result.title());
    }

    @Test
    void cannotAddDuplicateBookmark() {
        User user = user(7L, "reader");
        Comic comic = comic(12L, "PUBLISHED");
        setAuthentication("reader");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(bookmarkRepository.existsByUser_IdAndComic_Id(7L, 12L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> bookmarkService.addBookmark(new BookmarkRequest(12L)));
        verify(bookmarkRepository, never()).save(any(Bookmark.class));
    }

    @Test
    void cannotBookmarkUnpublishedComic() {
        User user = user(7L, "reader");
        Comic comic = comic(12L, "PENDING");
        setAuthentication("reader");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));

        assertThrows(ResourceNotFoundException.class,
                () -> bookmarkService.addBookmark(new BookmarkRequest(12L)));
        verify(bookmarkRepository, never()).save(any(Bookmark.class));
    }

    @Test
    void cannotDeleteAnotherUsersBookmark() {
        User user = user(7L, "reader");
        setAuthentication("reader");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(bookmarkRepository.findByIdAndUser_Id(3L, 7L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookmarkService.removeBookmark(3L));
        verify(bookmarkRepository, never()).delete(any(Bookmark.class));
    }

    @Test
    void deletesBookmarkOwnedByCurrentUser() {
        User user = user(7L, "reader");
        Bookmark bookmark = new Bookmark();
        bookmark.setId(3L);
        bookmark.setUser(user);
        setAuthentication("reader");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(bookmarkRepository.findByIdAndUser_Id(3L, 7L))
                .thenReturn(Optional.of(bookmark));

        bookmarkService.removeBookmark(3L);

        verify(bookmarkRepository).delete(bookmark);
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private Comic comic(Long id, String moderationStatus) {
        Comic comic = new Comic();
        comic.setId(id);
        comic.setTitle(
                "PUBLISHED".equals(moderationStatus) ? "Published" : moderationStatus);
        comic.setSlug("comic-" + id);
        comic.setModerationStatus(moderationStatus);
        comic.setIsDeleted(false);
        return comic;
    }

    private void setAuthentication(String username) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))));
    }
}
