package com.comichub.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "comics",
        uniqueConstraints = {
                @UniqueConstraint(name = "UQ_comics_slug", columnNames = "slug")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Comic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "slug", nullable = false, length = 220, columnDefinition = "VARCHAR(220)")
    private String slug;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Builder.Default
    @Column(name = "moderation_status", nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private String moderationStatus = "DRAFT";

    @Builder.Default
    @Column(name = "publication_status", nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private String publicationStatus = "ONGOING";

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewer;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @Builder.Default
    @Column(name = "rating_avg", nullable = false, precision = 3, scale = 2)
    private BigDecimal ratingAvg = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "rating_count", nullable = false)
    private Integer ratingCount = 0;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
