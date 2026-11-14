package com.comichub.dto.rating;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RatingRequest(
        @NotNull(message = "score không được để trống")
        @Min(value = 1, message = "score phải từ 1 đến 5")
        @Max(value = 5, message = "score phải từ 1 đến 5")
        Integer score,

        @Size(max = 300, message = "review tối đa 300 ký tự")
        String review
) {
}