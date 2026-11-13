package com.comichub.repository;

import com.comichub.entity.ChapterRevisionPage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChapterRevisionPageRepository
        extends JpaRepository<ChapterRevisionPage, Long> {

    @EntityGraph(attributePaths = {"revision", "revision.chapter", "revision.chapter.comic"})
    List<ChapterRevisionPage> findByRevision_IdOrderByPageNumberAsc(Long revisionId);

    @EntityGraph(attributePaths = {
            "revision", "revision.chapter", "revision.chapter.comic",
            "revision.chapter.comic.author", "revision.submittedBy"
    })
    Optional<ChapterRevisionPage> findWithDetailsById(Long id);

    boolean existsByImageUrlAndRevision_IdNot(String imageUrl, Long revisionId);
}
