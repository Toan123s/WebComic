
package com.comichub.dto.auth;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String username,
        String displayName
) {}
