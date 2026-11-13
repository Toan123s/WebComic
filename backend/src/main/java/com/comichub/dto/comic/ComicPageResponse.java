package com.comichub.dto.comic;

import java.util.List;

public record ComicPageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
