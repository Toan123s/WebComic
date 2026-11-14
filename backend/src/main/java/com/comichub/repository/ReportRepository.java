package com.comichub.repository;

import com.comichub.entity.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {

    @EntityGraph(attributePaths = {"reporter", "handledBy"})
    @Query(
            value = """
                    SELECT report FROM Report report
                    WHERE (:status IS NULL OR report.status = :status)
                      AND (:targetType IS NULL OR report.targetType = :targetType)
                    """,
            countQuery = """
                    SELECT COUNT(report) FROM Report report
                    WHERE (:status IS NULL OR report.status = :status)
                      AND (:targetType IS NULL OR report.targetType = :targetType)
                    """)
    Page<Report> search(
            @Param("status") String status,
            @Param("targetType") String targetType,
            Pageable pageable);

    @EntityGraph(attributePaths = {"reporter", "handledBy"})
    @Query("SELECT report FROM Report report WHERE report.id = :id")
    Optional<Report> findWithDetailsById(@Param("id") Long id);

    long countByStatus(String status);
}
