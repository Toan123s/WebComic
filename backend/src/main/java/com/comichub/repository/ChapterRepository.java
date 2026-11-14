package com.comichub.repository;

import com.comichub.entity.Chapter;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    long countByStatusAndIsDeletedFalse(String status);

    @EntityGraph(attributePaths = {"comic", "comic.author", "reviewer"})
    Optional<Chapter> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"comic", "comic.author"})
    List<Chapter> findByComic_IdAndIsDeletedFalseAndStatusOrderByChapterNumberAsc(
            Long comicId, String status);

    @EntityGraph(attributePaths = {"comic", "comic.author"})
    List<Chapter> findByComic_IdAndIsDeletedFalseOrderByChapterNumberAsc(Long comicId);

    @EntityGraph(attributePaths = {"comic", "comic.author"})
    List<Chapter> findByStatusAndIsDeletedFalseOrderByCreatedAtAsc(String status);

    boolean existsByComic_IdAndChapterNumber(Long comicId, BigDecimal chapterNumber);

    boolean existsByComic_IdAndChapterNumberAndIdNot(
            Long comicId, BigDecimal chapterNumber, Long id);
}

