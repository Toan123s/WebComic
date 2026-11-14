package com.comichub.dto.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ReportUpdateRequest(
        @NotBlank
        @Pattern(regexp = "(?i)IN_PROGRESS|RESOLVED|REJECTED",
                message = "status phải là IN_PROGRESS, RESOLVED hoặc REJECTED")
        String status,
        @Size(max = 500, message = "resolutionNote tối đa 500 ký tự")
        String resolutionNote
) {
}
