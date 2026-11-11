package com.comichub.dto.comic;

import jakarta.validation.constraints.Size;

public record ModerationDecisionRequest(
        @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
        String note
) {
}
