package com.comichub.dto.comment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CommentCreateRequest(
        @NotBlank(message = "Nội dung bình luận không được để trống")
        @Size(max = 1000, message = "Nội dung bình luận tối đa 1000 ký tự")
        String content,
        @Positive(message = "chapterId phải là số nguyên dương")
        Long chapterId,
        @Positive(message = "parentId phải là số nguyên dương")
        Long parentId
) {
}
