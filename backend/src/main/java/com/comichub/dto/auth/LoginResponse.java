/**
 * DỰ ÁN: ComicHub
 * FILE: LoginResponse.java
 * PHỤ TRÁCH: TV1 - Backend; phối hợp TV2
 * MỤC ĐÍCH: DTO response đăng nhập.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH.
 * CÒN THIẾU: Đảm bảo không trả password hash/secret; thống nhất định dạng token với frontend.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */


package com.comichub.dto.auth;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        long refreshExpiresIn,
        Long userId,
        String username,
        String displayName
) {}
