package com.comichub.repository;

import com.comichub.entity.ChapterRevision;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.List;
import java.util.Optional;

public interface ChapterRevisionRepository extends JpaRepository<ChapterRevision, Long> {

    boolean existsByChapter_IdAndStatusIn(Long chapterId, List<String> statuses);

    @EntityGraph(attributePaths = {"chapter", "chapter.comic", "submittedBy", "reviewer"})
    List<ChapterRevision> findByChapter_IdOrderBySubmittedAtDesc(Long chapterId);

    @EntityGraph(attributePaths = {"chapter", "chapter.comic", "chapter.comic.author", "submittedBy"})
    List<ChapterRevision> findByStatusOrderBySubmittedAtAsc(String status);

    @EntityGraph(attributePaths = {"chapter", "chapter.comic", "chapter.comic.author", "submittedBy", "reviewer"})
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ChapterRevision> findWithDetailsById(Long id);
}
