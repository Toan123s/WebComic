
package com.comichub.service;

import com.comichub.dto.user.UserCreateRequest;
import com.comichub.dto.user.UserUpdateRequest;
import com.comichub.dto.user.UserResponse;
import com.comichub.entity.User;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.mapper.UserMapper;
import com.comichub.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    // READ: Lấy danh sách người dùng
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    // READ: Lấy chi tiết người dùng
    public UserResponse getUserById(Long id) {
        validateId(id);

        User user = findUserById(id);

        return userMapper.toResponse(user);
    }

    // CREATE: Tạo người dùng
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {

        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException(
                    "Username đã tồn tại"
            );
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException(
                    "Email đã được sử dụng"
            );
        }

        User user = new User();

        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );
        user.setDisplayName(request.displayName());
        user.setAvatarUrl(request.avatarUrl());
        user.setBio(request.bio());
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }

    // UPDATE: Cập nhật thông tin người dùng
    @Transactional
    public UserResponse updateUser(
            Long id,
            UserUpdateRequest request) {

        validateId(id);

        User user = findUserById(id);

        if (userRepository.existsByUsernameAndIdNot(
                request.username(), id)) {

            throw new DuplicateResourceException(
                    "Username đã được người khác sử dụng"
            );
        }

        if (userRepository.existsByEmailAndIdNot(
                request.email(), id)) {

            throw new DuplicateResourceException(
                    "Email đã được người khác sử dụng"
            );
        }

        user.setUsername(request.username());
        user.setEmail(request.email());

        if (request.displayName() != null) {
            user.setDisplayName(request.displayName());
        }

        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }

        if (request.bio() != null) {
            user.setBio(request.bio());
        }

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }

    // DELETE: Xóa người dùng
    @Transactional
    public void deleteUser(Long id) {
        validateId(id);

        User user = findUserById(id);

        userRepository.delete(user);
    }

    // Hàm dùng chung để kiểm tra ID
    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "ID người dùng phải là số nguyên dương"
            );
        }
    }

    // Hàm dùng chung để tìm User
    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người dùng có ID: " + id
                ));
    }
}
