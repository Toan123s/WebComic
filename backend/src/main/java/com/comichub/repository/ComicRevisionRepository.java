package com.comichub.repository;

import com.comichub.entity.ComicRevision;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComicRevisionRepository extends JpaRepository<ComicRevision, Long> {

    boolean existsByComic_IdAndStatus(Long comicId, String status);

    @EntityGraph(attributePaths = {"comic", "comic.author", "submittedBy"})
    List<ComicRevision> findByStatusOrderBySubmittedAtAsc(String status);

    @EntityGraph(attributePaths = {"comic", "comic.author", "submittedBy", "reviewer"})
    List<ComicRevision> findByComic_IdOrderBySubmittedAtDesc(Long comicId);

    @EntityGraph(attributePaths = {"comic", "comic.author", "submittedBy"})
    Optional<ComicRevision> findWithDetailsById(Long id);
}
