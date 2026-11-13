package com.comichub.dto.role;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record UserRolesUpdateRequest(
        @NotEmpty List<@NotBlank String> roles) {
}
