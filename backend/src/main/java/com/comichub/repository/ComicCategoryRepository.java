package com.comichub.repository;

import com.comichub.entity.ComicCategory;
import com.comichub.entity.ComicCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComicCategoryRepository
        extends JpaRepository<ComicCategory, ComicCategoryId> {

    List<ComicCategory> findAllById_ComicId(Long comicId);

    boolean existsById_CategoryId(Integer categoryId);

    void deleteAllById_ComicId(Long comicId);
}

