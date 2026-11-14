package com.comichub.repository;

import com.comichub.entity.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    @EntityGraph(attributePaths = {"comic", "creator"})
    Page<Follow> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"comic", "creator"})
    Page<Follow> findByUser_IdAndTargetTypeOrderByCreatedAtDesc(
            Long userId, String targetType, Pageable pageable);

    @EntityGraph(attributePaths = {"comic", "creator"})
    Optional<Follow> findByIdAndUser_Id(Long id, Long userId);

    boolean existsByUser_IdAndTargetTypeAndComic_Id(
            Long userId, String targetType, Long comicId);

    boolean existsByUser_IdAndTargetTypeAndCreator_Id(
            Long userId, String targetType, Long creatorId);

    void deleteByCreator_Id(Long creatorId);

    @Query("""
            SELECT follow.user.id
            FROM Follow follow
            WHERE follow.targetType = 'COMIC'
              AND follow.comic.id = :comicId
              AND follow.notifyEnabled = true
              AND follow.user.status = 'ACTIVE'
            """)
    List<Long> findActiveComicFollowerIds(@Param("comicId") Long comicId);

    @Query("""
            SELECT follow.user.id
            FROM Follow follow
            WHERE follow.targetType = 'CREATOR'
              AND follow.creator.id = :creatorId
              AND follow.notifyEnabled = true
              AND follow.user.status = 'ACTIVE'
            """)
    List<Long> findActiveCreatorFollowerIds(@Param("creatorId") Long creatorId);
}
