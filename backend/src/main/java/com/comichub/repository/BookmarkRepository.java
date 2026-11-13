package com.comichub.repository;

import com.comichub.entity.Bookmark;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    @EntityGraph(attributePaths = "comic")
    List<Bookmark> findByUser_IdOrderByCreatedAtDesc(Long userId);

    boolean existsByUser_IdAndComic_Id(Long userId, Long comicId);

    Optional<Bookmark> findByIdAndUser_Id(Long id, Long userId);
}