
package com.comichub.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(message = "Username hoặc email không được để trống")
        String usernameOrEmail,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password

) {}
