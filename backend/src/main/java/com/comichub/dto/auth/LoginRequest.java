/**
 * DỰ ÁN: ComicHub
 * FILE: LoginRequest.java
 * PHỤ TRÁCH: TV1 - Backend; phối hợp TV2
 * MỤC ĐÍCH: DTO request đăng nhập.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH.
 * CÒN THIẾU: Đối chiếu tên trường/validation với frontend và API contract.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */


package com.comichub.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(message = "Username hoặc email không được để trống")
        String usernameOrEmail,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password

) {}
