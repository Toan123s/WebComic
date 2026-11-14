package com.comichub.dto.follow;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record FollowRequest(
        @NotBlank
        @Pattern(regexp = "(?i)COMIC|CREATOR",
                message = "targetType phải là COMIC hoặc CREATOR")
        String targetType,
        @Positive(message = "targetId phải là số nguyên dương")
        Long targetId,
        Boolean notifyEnabled
) {
}
