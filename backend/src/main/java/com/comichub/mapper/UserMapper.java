package com.comichub.mapper;


/**
 * DỰ ÁN: ComicHub
 * FILE: UserMapper.java
 * PHỤ TRÁCH: TV1 - Backend
 * MỤC ĐÍCH: Chuyển đổi giữa Entity và DTO cho User.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — chưa kết luận hoàn thành; cần kiểm thử theo task.
 * CÒN THIẾU: Cần xác nhận tiêu chí hoàn thành, kiểm thử phù hợp và cập nhật trạng thái sau khi hoàn tất.
 * LƯU Ý: Không truy vấn database, kiểm tra quyền hoặc chứa nghiệp vụ.
 */

import com.comichub.dto.user.UserResponse;
import com.comichub.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}