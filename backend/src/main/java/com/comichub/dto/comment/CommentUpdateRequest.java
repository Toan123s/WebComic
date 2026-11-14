package com.comichub.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentUpdateRequest(
        @NotBlank(message = "Nội dung bình luận không được để trống")
        @Size(max = 1000, message = "Nội dung bình luận tối đa 1000 ký tự")
        String content
) {
}
