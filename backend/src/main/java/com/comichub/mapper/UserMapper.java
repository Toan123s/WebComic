package com.comichub.mapper;

import com.comichub.dto.user.UserResponse;
import com.comichub.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}