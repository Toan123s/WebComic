package com.comichub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "chapter_revision_pages",
        uniqueConstraints = @UniqueConstraint(
                name = "UQ_chapter_revision_pages_revision_page",
                columnNames = {"revision_id", "page_number"}))
@Getter
@Setter
@NoArgsConstructor
public class ChapterRevisionPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "revision_id", nullable = false)
    private ChapterRevision revision;

    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    private Integer width;

    private Integer height;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "uploaded_for_revision", nullable = false)
    private Boolean uploadedForRevision = false;
}
