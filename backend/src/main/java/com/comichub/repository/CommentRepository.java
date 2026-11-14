package com.comichub.repository;

import com.comichub.entity.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = {"user", "chapter", "parent", "hiddenBy"})
    @Query("""
            SELECT comment
            FROM Comment comment
            WHERE comment.comic.id = :comicId
              AND ((:chapterId IS NULL AND comment.chapter IS NULL)
                   OR comment.chapter.id = :chapterId)
              AND comment.status <> 'DELETED'
              AND (comment.status = 'VISIBLE'
                   OR (:viewerId IS NOT NULL AND comment.user.id = :viewerId)
                   OR :moderatorView = true)
            ORDER BY comment.createdAt ASC, comment.id ASC
            """)
    List<Comment> findVisibleForViewer(
            @Param("comicId") Long comicId,
            @Param("chapterId") Long chapterId,
            @Param("viewerId") Long viewerId,
            @Param("moderatorView") boolean moderatorView);

    @EntityGraph(attributePaths = {"user", "comic", "chapter", "parent", "hiddenBy"})
    List<Comment> findByStatusOrderByCreatedAtAsc(String status);

    @EntityGraph(attributePaths = {"user", "comic", "chapter", "parent", "hiddenBy"})
    @Query("SELECT comment FROM Comment comment WHERE comment.id = :id")
    Optional<Comment> findWithDetailsById(@Param("id") Long id);

    long countByStatus(String status);
}
