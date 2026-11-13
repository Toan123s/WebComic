package com.comichub.repository;

import com.comichub.entity.ChapterPage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChapterPageRepository extends JpaRepository<ChapterPage, Long> {

    @EntityGraph(attributePaths = {"chapter", "chapter.comic", "chapter.comic.author"})
    List<ChapterPage> findByChapter_IdOrderByPageNumberAsc(Long chapterId);

    @EntityGraph(attributePaths = {"chapter", "chapter.comic", "chapter.comic.author"})
    Optional<ChapterPage> findWithDetailsById(Long id);

    int countByChapter_Id(Long chapterId);

    boolean existsByChapter_IdAndPageNumber(Long chapterId, Integer pageNumber);
}

