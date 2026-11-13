package com.comichub.dto.chapter;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ChapterRevisionCreateRequest(
        @DecimalMin("0.1") @Digits(integer = 5, fraction = 1) BigDecimal chapterNumber,
        @Size(max = 200) String title) {
}
