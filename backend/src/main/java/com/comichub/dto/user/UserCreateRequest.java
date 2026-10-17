
package com.comichub.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(

        @NotBlank(message = "Username không được để trống")
        @Size(min = 3, max = 50,
                message = "Username phải có từ 3 đến 50 ký tự")
        String username,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        @Size(max = 100, message = "Email tối đa 100 ký tự")
        String email,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 8, max = 72,
                message = "Mật khẩu phải có từ 8 đến 72 ký tự")
        String password,

        @Size(max = 100, message = "Tên hiển thị tối đa 100 ký tự")
        String displayName,

        @Size(max = 500, message = "Avatar URL tối đa 500 ký tự")
        String avatarUrl,

        @Size(max = 500, message = "Bio tối đa 500 ký tự")
        String bio

) {}
