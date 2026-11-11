package com.comichub.dto.comic;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

/**
 * DỰ ÁN: ComicHub
 * FILE: ComicUpdateRequest.java
 * PHỤ TRÁCH: TV1 - Backend
 * MỤC ĐÍCH: DTO nhận dữ liệu cập nhật truyện.
 * TRẠNG THÁI: ĐANG TRIỂN KHAI — cần kiểm thử validation.
 */
public record ComicUpdateRequest(

        @Size(max = 200, message = "Tên truyện tối đa 200 ký tự")
        String title,

        String description,

        @Size(max = 500, message = "Cover URL tối đa 500 ký tự")
        String coverUrl,

        @Pattern(regexp = "ONGOING|COMPLETED|HIATUS",
                message = "Trạng thái truyện không hợp lệ")
        String publicationStatus

) {
}