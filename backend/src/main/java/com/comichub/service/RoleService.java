package com.comichub.service;

import com.comichub.dto.role.RoleResponse;
import com.comichub.dto.role.UserRolesResponse;
import com.comichub.dto.role.UserRolesUpdateRequest;
import com.comichub.entity.Role;
import com.comichub.entity.User;
import com.comichub.entity.UserRole;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.repository.RoleRepository;
import com.comichub.repository.UserRepository;
import com.comichub.repository.UserRoleRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class RoleService {

    private static final Set<String> ALLOWED_ROLES =
            Set.of("USER", "AUTHOR", "MODERATOR", "ADMIN");

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public RoleService(
            RoleRepository roleRepository,
            UserRepository userRepository,
            UserRoleRepository userRoleRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }

    public List<RoleResponse> getRoles() {
        requireAdmin();
        return roleRepository.findAllByOrderByNameAsc().stream()
                .filter(role -> ALLOWED_ROLES.contains(role.getName()))
                .map(role -> new RoleResponse(
                        role.getId(), role.getName(), role.getDescription()))
                .toList();
    }

    public UserRolesResponse getUserRoles(Long userId) {
        requireAdmin();
        validateUserId(userId);
        User user = findUser(userId);
        return toResponse(user, userRoleRepository.findAssignmentsByUserId(userId));
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public UserRolesResponse replaceUserRoles(
            Long userId, UserRolesUpdateRequest request) {
        requireAdmin();
        validateUserId(userId);
        if (request == null || request.roles() == null || request.roles().isEmpty()) {
            throw new IllegalArgumentException("Phải gán ít nhất một role");
        }

        User user = findUser(userId);
        List<String> roleNames = request.roles().stream()
                .map(role -> role == null ? "" : role.trim().toUpperCase(Locale.ROOT))
                .distinct()
                .toList();
        if (roleNames.stream().anyMatch(role -> !ALLOWED_ROLES.contains(role))) {
            throw new IllegalArgumentException(
                    "Role chỉ được thuộc USER, AUTHOR, MODERATOR hoặc ADMIN");
        }

        List<UserRole> currentAssignments =
                userRoleRepository.findAssignmentsByUserId(userId);
        boolean currentlyAdmin = currentAssignments.stream()
                .anyMatch(assignment -> "ADMIN".equals(assignment.getRole().getName()));
        boolean willBeAdmin = roleNames.contains("ADMIN");
        if (currentlyAdmin && !willBeAdmin
                && userRoleRepository.countByRole_NameAndUser_Status("ADMIN", "ACTIVE") <= 1) {
            throw new DuplicateResourceException(
                    "Không thể gỡ role ADMIN cuối cùng đang hoạt động");
        }

        List<Role> roles = roleNames.stream()
                .map(name -> roleRepository.findByName(name)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Role chưa được seed trong database: " + name)))
                .toList();

        userRoleRepository.deleteAll(currentAssignments);
        userRoleRepository.flush();
        List<UserRole> assignments = roles.stream()
                .map(role -> {
                    UserRole assignment = new UserRole();
                    assignment.setUser(user);
                    assignment.setRole(role);
                    return assignment;
                })
                .toList();
        userRoleRepository.saveAll(assignments);
        return new UserRolesResponse(userId, user.getUsername(), roleNames);
    }

    private UserRolesResponse toResponse(User user, List<UserRole> assignments) {
        List<String> roleNames = assignments.stream()
                .map(assignment -> assignment.getRole().getName())
                .sorted()
                .toList();
        return new UserRolesResponse(user.getId(), user.getUsername(), roleNames);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người dùng có ID: " + userId));
    }

    private void validateUserId(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("ID người dùng phải là số nguyên dương");
        }
    }

    private void requireAdmin() {
        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!isAdmin) {
            throw new AccessDeniedException("Chỉ ADMIN mới được quản lý role");
        }
    }
}
