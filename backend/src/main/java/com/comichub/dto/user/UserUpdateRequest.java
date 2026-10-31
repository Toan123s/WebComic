/**
 * DỰ ÁN: ComicHub
 * FILE: UserUpdateRequest.java
 * PHỤ TRÁCH: TV1 - Backend; phối hợp TV2
 * MỤC ĐÍCH: DTO cập nhật User.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH.
 * CÒN THIẾU: Kiểm thử validation và giới hạn trường mà người gọi được phép cập nhật.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */


package com.comichub.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(

        @NotBlank(message = "Username không được để trống")
        @Size(min = 3, max = 50,
                message = "Username phải có từ 3 đến 50 ký tự")
        String username,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        @Size(max = 100, message = "Email tối đa 100 ký tự")
        String email,

        @Size(max = 100, message = "Tên hiển thị tối đa 100 ký tự")
        String displayName,

        @Size(max = 500, message = "Avatar URL tối đa 500 ký tự")
        String avatarUrl,

        @Size(max = 500, message = "Bio tối đa 500 ký tự")
        String bio

) {}
