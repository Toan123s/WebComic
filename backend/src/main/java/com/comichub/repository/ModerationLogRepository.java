/**
 * DỰ ÁN: ComicHub
 * FILE: ModerationLogRepository.java
 * PHỤ TRÁCH: TV1 - Backend
 * MỤC ĐÍCH: Truy vấn persistence cho ModerationLog.
 * TRẠNG THÁI: CHƯA TRIỂN KHAI — file khung, chưa có mã chức năng.
 * CÒN THIẾU: Cần bổ sung implementation theo API contract và kiểm thử; cập nhật trạng thái sau khi hoàn thành.
 * LƯU Ý: Chỉ xử lý truy vấn dữ liệu; nghiệp vụ và ownership thuộc Service.
 */

package com.comichub.repository;

import com.comichub.entity.ModerationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ModerationLogRepository extends JpaRepository<ModerationLog, Long> {

    @EntityGraph(attributePaths = {"comic", "chapter", "moderator"})
    @Query(
            value = """
                    SELECT log
                    FROM ModerationLog log
                    LEFT JOIN log.chapter chapter
                    WHERE (:comicId IS NULL OR log.comic.id = :comicId)
                      AND (:chapterId IS NULL OR chapter.id = :chapterId)
                      AND (:moderatorId IS NULL OR log.moderator.id = :moderatorId)
                      AND (:action IS NULL OR log.action = :action)
                    """,
            countQuery = """
                    SELECT COUNT(log)
                    FROM ModerationLog log
                    LEFT JOIN log.chapter chapter
                    WHERE (:comicId IS NULL OR log.comic.id = :comicId)
                      AND (:chapterId IS NULL OR chapter.id = :chapterId)
                      AND (:moderatorId IS NULL OR log.moderator.id = :moderatorId)
                      AND (:action IS NULL OR log.action = :action)
                    """)
    Page<ModerationLog> searchLogs(
            @Param("comicId") Long comicId,
            @Param("chapterId") Long chapterId,
            @Param("moderatorId") Long moderatorId,
            @Param("action") String action,
            Pageable pageable);
}
