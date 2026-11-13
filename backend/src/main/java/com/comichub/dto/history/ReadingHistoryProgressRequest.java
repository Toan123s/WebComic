package com.comichub.dto.history;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ReadingHistoryProgressRequest(
        @NotNull @Positive Long chapterId,
        @NotNull @Positive Integer lastPageNumber
) {
}
