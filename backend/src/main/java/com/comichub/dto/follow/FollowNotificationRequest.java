package com.comichub.dto.follow;

import jakarta.validation.constraints.NotNull;

public record FollowNotificationRequest(
        @NotNull(message = "notifyEnabled không được để trống")
        Boolean notifyEnabled
) {
}
