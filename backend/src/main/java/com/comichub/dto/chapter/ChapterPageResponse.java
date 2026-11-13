package com.comichub.dto.chapter;

public record ChapterPageResponse(
        Long id,
        Integer pageNumber,
        String imageUrl,
        Integer width,
        Integer height,
        Long fileSize
) {
}

