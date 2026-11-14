
package com.comichub.service;


/**
 * DỰ ÁN: ComicHub
 * FILE: UserService.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Xử lý nghiệp vụ cho chức năng User.
 * TRẠNG THÁI: CRUD CÓ OWNERSHIP; REGISTRATION CHỈ GÁN ROLE USER.
 * CÒN THIẾU: Role assignment/admin status management chưa có API.
 * LƯU Ý: Triển khai validation nghiệp vụ, ownership/trạng thái, lỗi và transaction khi cần; phối hợp schema/API contract.
 */

import com.comichub.dto.user.UserCreateRequest;
import com.comichub.dto.user.UserUpdateRequest;
import com.comichub.dto.user.UserResponse;
import com.comichub.entity.Role;
import com.comichub.entity.User;
import com.comichub.entity.UserRole;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.mapper.UserMapper;
import com.comichub.repository.FollowRepository;
import com.comichub.repository.RoleRepository;
import com.comichub.repository.UserRepository;
import com.comichub.repository.UserRoleRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final FollowRepository followRepository;

    public UserService(
            UserRepository userRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            FollowRepository followRepository) {

        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.followRepository = followRepository;
    }

    // READ: Lấy danh sách người dùng
    public List<UserResponse> getAllUsers() {
        requireRole("ADMIN");
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    // READ: Lấy chi tiết người dùng
    public UserResponse getUserById(Long id) {
        validateId(id);

        User user = findUserById(id);
        requireSelfOrAdmin(user);

        return userMapper.toResponse(user);
    }

    public UserResponse getCurrentUserProfile() {
        return userMapper.toResponse(getCurrentUser());
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
        Role defaultRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy role mặc định USER"));
        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(defaultRole);
        userRoleRepository.save(userRole);

        return userMapper.toResponse(savedUser);
    }

    // UPDATE: Cập nhật thông tin người dùng
    @Transactional
    public UserResponse updateUser(
            Long id,
            UserUpdateRequest request) {

        validateId(id);

        User user = findUserById(id);
        requireSelfOrAdmin(user);

        return updateProfile(user, id, request);
    }

    @Transactional
    public UserResponse updateCurrentUserProfile(UserUpdateRequest request) {
        User user = getCurrentUser();
        return updateProfile(user, user.getId(), request);
    }

    private UserResponse updateProfile(
            User user, Long id, UserUpdateRequest request) {
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
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void deleteUser(Long id) {
        requireRole("ADMIN");
        validateId(id);

        User user = findUserById(id);
        boolean activeAdmin = "ACTIVE".equals(user.getStatus())
                && userRoleRepository.findRoleNamesByUserId(id).contains("ADMIN");
        if (activeAdmin
                && userRoleRepository.countByRole_NameAndUser_Status("ADMIN", "ACTIVE") <= 1) {
            throw new DuplicateResourceException(
                    "Không thể xóa tài khoản ADMIN cuối cùng đang hoạt động");
        }

        followRepository.deleteByCreator_Id(id);
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

    private User getCurrentUser() {
        Authentication authentication = currentAuthentication();
        if (!isAuthenticated(authentication)) {
            throw new AccessDeniedException("Bạn chưa đăng nhập");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản hiện tại"));
    }

    private void requireSelfOrAdmin(User user) {
        Authentication authentication = currentAuthentication();
        if (hasRole(authentication, "ADMIN")) {
            return;
        }
        if (!isAuthenticated(authentication)) {
            throw new AccessDeniedException("Bạn chưa đăng nhập");
        }
        User currentUser = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản: " + authentication.getName()));
        if (!user.getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập tài khoản này");
        }
    }

    private void requireRole(String role) {
        if (!hasRole(currentAuthentication(), role)) {
            throw new AccessDeniedException("Bạn không có quyền thực hiện thao tác này");
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> ("ROLE_" + role).equals(authority.getAuthority()));
    }

    private boolean isAuthenticated(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }

    private Authentication currentAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}
