package com.comichub.controller;

import com.comichub.dto.category.CategoryResponse;
import com.comichub.dto.category.ComicCategoryRequest;
import com.comichub.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ComicCategoryController {

    private final CategoryService categoryService;

    public ComicCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/api/comics/{comicId}/categories")
    public ResponseEntity<List<CategoryResponse>> getComicCategories(
            @PathVariable Long comicId) {
        return ResponseEntity.ok(categoryService.getComicCategories(comicId));
    }

    @PutMapping("/api/comics/{comicId}/categories")
    @PreAuthorize("hasRole('AUTHOR')")
    public ResponseEntity<List<CategoryResponse>> setComicCategories(
            @PathVariable Long comicId,
            @Valid @RequestBody ComicCategoryRequest request) {
        return ResponseEntity.ok(categoryService.setComicCategories(
                comicId, request.categoryIds()));
    }
}
