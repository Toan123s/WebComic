/**
 * DỰ ÁN: ComicHub
 * FILE: RefreshTokenRequest.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Thành phần backend RefreshTokenRequest.
 * TRẠNG THÁI: CHƯA TRIỂN KHAI — file khung, chưa có mã chức năng.
 * CÒN THIẾU: Cần bổ sung implementation theo API contract và kiểm thử; cập nhật trạng thái sau khi hoàn thành.
 * LƯU Ý: Đối chiếu với API contract, schema và các thành phần liên quan trước khi triển khai.
 */

package com.comichub.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token không được để trống")
        @Size(max = 128, message = "Refresh token không hợp lệ")
        String refreshToken
) {
}
