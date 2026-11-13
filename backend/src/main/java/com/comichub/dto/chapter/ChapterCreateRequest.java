package com.comichub.dto.chapter;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ChapterCreateRequest(
        @NotNull(message = "Số chapter không được để trống")
        @DecimalMin(value = "0.1", message = "Số chapter phải lớn hơn 0")
        @DecimalMax(value = "99999.9", message = "Số chapter vượt giới hạn")
        @Digits(integer = 5, fraction = 1, message = "Số chapter chỉ hỗ trợ tối đa 1 chữ số thập phân")
        BigDecimal chapterNumber,

        @Size(max = 200, message = "Tiêu đề chapter tối đa 200 ký tự")
        String title
) {
}

