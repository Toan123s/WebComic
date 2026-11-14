package com.comichub.repository;

import com.comichub.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByUser_IdAndComic_Id(Long userId, Long comicId);

    // Tính điểm trung bình và tổng số lượt đánh giá trực tiếp từ DB.
    @Query("""
            SELECT AVG(r.score) AS average, COUNT(r) AS total
            FROM Rating r
            WHERE r.comic.id = :comicId
            """)
    RatingSummary summarize(@Param("comicId") Long comicId);

    // Dùng UPDATE trực tiếp để không làm đổi comics.updated_at (auditing)
    // mỗi lần có người chấm điểm.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            UPDATE Comic c
            SET c.ratingAvg = :average, c.ratingCount = :total
            WHERE c.id = :comicId
            """)
    int updateComicRatingStats(
            @Param("comicId") Long comicId,
            @Param("average") BigDecimal average,
            @Param("total") Integer total);

    interface RatingSummary {

        Double getAverage();

        Long getTotal();
    }
}