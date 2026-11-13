/**
 * DỰ ÁN: ComicHub
 * FILE: BookmarkResponse.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Thành phần backend BookmarkResponse.
 * TRẠNG THÁI: ĐÃ TRIỂN KHAI.
 * CÒN THIẾU: Đối chiếu lại nếu API response thay đổi.
 * LƯU Ý: Đối chiếu với API contract, schema và các thành phần liên quan trước khi triển khai.
 */

package com.comichub.dto.bookmark;

import java.time.LocalDateTime;

public record BookmarkResponse(
        Long id,
        Long comicId,
        String title,
        String slug,
        String coverUrl,
        LocalDateTime createdAt
) {
}
