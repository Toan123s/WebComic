package com.comichub.dto.category;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ComicCategoryRequest(
        @NotNull(message = "Danh sách categoryIds không được để trống")
        List<Integer> categoryIds
) {
}
