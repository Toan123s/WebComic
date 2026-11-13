package com.comichub.dto.role;

import java.util.List;

public record UserRolesResponse(Long userId, String username, List<String> roles) {
}
