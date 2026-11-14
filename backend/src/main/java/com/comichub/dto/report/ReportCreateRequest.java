package com.comichub.dto.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ReportCreateRequest(
        @NotBlank
        @Pattern(regexp = "(?i)COMIC|CHAPTER|COMMENT",
                message = "targetType phải là COMIC, CHAPTER hoặc COMMENT")
        String targetType,
        @Positive(message = "targetId phải là số nguyên dương")
        Long targetId,
        @NotBlank
        @Pattern(regexp = "(?i)SPAM|INAPPROPRIATE|COPYRIGHT|OTHER",
                message = "reason không hợp lệ")
        String reason,
        @Size(max = 500, message = "description tối đa 500 ký tự")
        String description
) {
}
