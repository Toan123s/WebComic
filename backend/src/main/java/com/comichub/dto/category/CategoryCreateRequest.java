package com.comichub.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(
        @NotBlank(message = "Tên thể loại không được để trống")
        @Size(max = 50, message = "Tên thể loại tối đa 50 ký tự")
        String name,

        @Size(max = 300, message = "Mô tả thể loại tối đa 300 ký tự")
        String description
) {
}

