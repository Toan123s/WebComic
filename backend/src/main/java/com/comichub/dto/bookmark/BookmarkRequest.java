package com.comichub.dto.bookmark;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BookmarkRequest(
        @NotNull(message = "comicId không được để trống")
        @Positive(message = "comicId phải là số nguyên dương")
        Long comicId
) {
}
