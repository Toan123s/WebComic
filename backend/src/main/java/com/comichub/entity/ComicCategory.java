package com.comichub.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comic_categories")
@Getter
@Setter
@NoArgsConstructor
public class ComicCategory {

    @EmbeddedId
    private ComicCategoryId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("comicId")
    @JoinColumn(name = "comic_id", nullable = false)
    private Comic comic;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("categoryId")
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public ComicCategory(Comic comic, Category category) {
        this.comic = comic;
        this.category = category;
        this.id = new ComicCategoryId(comic.getId(), category.getId());
    }
}