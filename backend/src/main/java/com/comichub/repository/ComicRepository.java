package com.comichub.repository;

import com.comichub.entity.Comic;
import org.springframework.data.jpa.repository.EntityGraph;
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
}