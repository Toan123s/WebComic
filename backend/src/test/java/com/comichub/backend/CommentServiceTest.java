package com.comichub.backend;

import com.comichub.dto.comment.CommentCreateRequest;
import com.comichub.dto.comment.CommentUpdateRequest;
import com.comichub.entity.Comment;
import com.comichub.entity.Comic;
import com.comichub.entity.User;
import com.comichub.repository.ChapterRepository;
import com.comichub.repository.CommentRepository;
import com.comichub.repository.ComicRepository;
import com.comichub.repository.UserRepository;
import com.comichub.service.CommentService;
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
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;
    @Mock
    private ComicRepository comicRepository;
    @Mock
    private ChapterRepository chapterRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CommentService commentService;

    @BeforeEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void newCommentIsPendingUntilModerated() {
        User reader = user(2L, "reader");
        Comic comic = comic(12L);
        authenticate("reader", "ROLE_USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reader));
        when(comicRepository.findWithAuthorById(12L)).thenReturn(Optional.of(comic));
        when(commentRepository.save(any(Comment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = commentService.createComment(
                12L, new CommentCreateRequest("  Hay quá  ", null, null));

        assertEquals("PENDING", response.status());
        assertEquals("Hay quá", response.content());
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    void editingVisibleCommentReturnsItToModerationQueue() {
        User reader = user(2L, "reader");
        Comment comment = comment(40L, reader, comic(12L), "VISIBLE");
        authenticate("reader", "ROLE_USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reader));
        when(commentRepository.findWithDetailsById(40L)).thenReturn(Optional.of(comment));
        when(commentRepository.save(comment)).thenReturn(comment);

        var response = commentService.updateComment(
                40L, new CommentUpdateRequest("Nội dung đã sửa"));

        assertEquals("PENDING", response.status());
        assertEquals("Nội dung đã sửa", response.content());
    }

    @Test
    void anotherUserCannotEditComment() {
        User owner = user(2L, "owner");
        User reader = user(3L, "reader");
        Comment comment = comment(40L, owner, comic(12L), "PENDING");
        authenticate("reader", "ROLE_USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reader));
        when(commentRepository.findWithDetailsById(40L)).thenReturn(Optional.of(comment));

        assertThrows(AccessDeniedException.class,
                () -> commentService.updateComment(
                        40L, new CommentUpdateRequest("Nội dung khác")));
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    void moderatorCannotApproveTheirOwnComment() {
        User moderator = user(2L, "moderator");
        Comment comment = comment(40L, moderator, comic(12L), "PENDING");
        authenticate("moderator", "ROLE_MODERATOR");
        when(userRepository.findByUsername("moderator"))
                .thenReturn(Optional.of(moderator));
        when(commentRepository.findWithDetailsById(40L)).thenReturn(Optional.of(comment));

        assertThrows(AccessDeniedException.class,
                () -> commentService.approveComment(40L));
        verify(commentRepository, never()).save(any(Comment.class));
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private Comic comic(Long id) {
        Comic comic = new Comic();
        comic.setId(id);
        comic.setModerationStatus("PUBLISHED");
        comic.setIsDeleted(false);
        return comic;
    }

    private Comment comment(Long id, User owner, Comic comic, String status) {
        Comment comment = new Comment();
        comment.setId(id);
        comment.setUser(owner);
        comment.setComic(comic);
        comment.setContent("Nội dung");
        comment.setStatus(status);
        return comment;
    }

    private void authenticate(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority(role))));
    }
}
