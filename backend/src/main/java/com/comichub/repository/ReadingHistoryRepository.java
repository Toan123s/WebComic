package com.comichub.repository;

import com.comichub.entity.ReadingHistory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Long> {

    @EntityGraph(attributePaths = {"comic", "chapter"})
    List<ReadingHistory> findByUser_IdOrderByReadAtDesc(Long userId);

    Optional<ReadingHistory> findByUser_IdAndComic_Id(Long userId, Long comicId);

    Optional<ReadingHistory> findByIdAndUser_Id(Long id, Long userId);
}
