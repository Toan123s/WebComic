package com.comichub.repository;

import com.comichub.entity.Comic;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComicRepository extends JpaRepository<Comic, Long> {

    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = "author")
    Optional<Comic> findWithAuthorById(Long id);

    @EntityGraph(attributePaths = "author")
    List<Comic> findByModerationStatusAndIsDeletedFalseOrderByPublishedAtDesc(
            String moderationStatus);

    @EntityGraph(attributePaths = "author")
    List<Comic> findByAuthor_IdAndIsDeletedFalseOrderByCreatedAtDesc(Long authorId);

    @EntityGraph(attributePaths = "author")
    List<Comic> findByModerationStatusAndIsDeletedFalseOrderBySubmittedAtAsc(
            String moderationStatus);

    @EntityGraph(attributePaths = "author")
    @Query(
            value = """
                    SELECT c
                    FROM Comic c
                    WHERE c.moderationStatus = :publishedStatus
                      AND c.isDeleted = false
                      AND (:keywordPattern IS NULL
                           OR LOWER(c.title) LIKE :keywordPattern
                           OR LOWER(COALESCE(c.description, '')) LIKE :keywordPattern)
                      AND (:publicationStatus IS NULL
                           OR c.publicationStatus = :publicationStatus)
                      AND (:categoryId IS NULL OR EXISTS (
                           SELECT cc.id
                           FROM ComicCategory cc
                           WHERE cc.id.comicId = c.id
                             AND cc.id.categoryId = :categoryId))
                    """,
            countQuery = """
                    SELECT COUNT(c)
                    FROM Comic c
                    WHERE c.moderationStatus = :publishedStatus
                      AND c.isDeleted = false
                      AND (:keywordPattern IS NULL
                           OR LOWER(c.title) LIKE :keywordPattern
                           OR LOWER(COALESCE(c.description, '')) LIKE :keywordPattern)
                      AND (:publicationStatus IS NULL
                           OR c.publicationStatus = :publicationStatus)
                      AND (:categoryId IS NULL OR EXISTS (
                           SELECT cc.id
                           FROM ComicCategory cc
                           WHERE cc.id.comicId = c.id
                             AND cc.id.categoryId = :categoryId))
                    """)
    Page<Comic> searchPublished(
            @Param("publishedStatus") String publishedStatus,
            @Param("keywordPattern") String keywordPattern,
            @Param("categoryId") Integer categoryId,
            @Param("publicationStatus") String publicationStatus,
            Pageable pageable);
}