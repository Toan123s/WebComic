package com.comichub.backend;

import com.comichub.dto.role.UserRolesUpdateRequest;
import com.comichub.entity.Role;
import com.comichub.entity.User;
import com.comichub.entity.UserRole;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.repository.RoleRepository;
import com.comichub.repository.UserRepository;
import com.comichub.repository.UserRoleRepository;
import com.comichub.service.RoleService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleServiceTest {

    @Mock
    private RoleRepository roleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserRoleRepository userRoleRepository;

    @InjectMocks
    private RoleService roleService;

    @BeforeEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void adminCanReplaceUsersRoles() {
        User user = user(8L, "creator");
        Role authorRole = role(2, "AUTHOR");
        setAuthentication("admin", "ADMIN");
        when(userRepository.findById(8L)).thenReturn(Optional.of(user));
        when(userRoleRepository.findAssignmentsByUserId(8L)).thenReturn(List.of());
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(role(1, "USER")));
        when(roleRepository.findByName("AUTHOR")).thenReturn(Optional.of(authorRole));

        var result = roleService.replaceUserRoles(
                8L, new UserRolesUpdateRequest(List.of(" user ", "author", "USER")));

        assertEquals(8L, result.userId());
        assertEquals("creator", result.username());
        assertEquals(List.of("USER", "AUTHOR"), result.roles());
        verify(userRoleRepository).saveAll(anyList());
    }

    @Test
    void adminCannotRemoveTheLastActiveAdminRole() {
        User admin = user(7L, "admin");
        UserRole assignment = new UserRole();
        assignment.setUser(admin);
        assignment.setRole(role(4, "ADMIN"));
        setAuthentication("admin", "ADMIN");
        when(userRepository.findById(7L)).thenReturn(Optional.of(admin));
        when(userRoleRepository.findAssignmentsByUserId(7L))
                .thenReturn(List.of(assignment));
        when(userRoleRepository.countByRole_NameAndUser_Status("ADMIN", "ACTIVE"))
                .thenReturn(1L);

        assertThrows(DuplicateResourceException.class,
                () -> roleService.replaceUserRoles(
                        7L, new UserRolesUpdateRequest(List.of("USER"))));
        verify(userRoleRepository, never()).deleteAll(anyList());
    }

    @Test
    void rejectsUnknownRolesWithoutChangingAssignments() {
        User user = user(8L, "creator");
        setAuthentication("admin", "ADMIN");
        when(userRepository.findById(8L)).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class,
                () -> roleService.replaceUserRoles(
                        8L, new UserRolesUpdateRequest(List.of("SUPERUSER"))));
        verify(userRoleRepository, never()).deleteAll(anyList());
    }

    @Test
    void nonAdminCannotListRoles() {
        setAuthentication("reader", "USER");

        assertThrows(AccessDeniedException.class, roleService::getRoles);
        verify(roleRepository, never()).findAllByOrderByNameAsc();
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setStatus("ACTIVE");
        return user;
    }

    private Role role(Integer id, String name) {
        Role role = new Role();
        role.setId(id);
        role.setName(name);
        return role;
    }

    private void setAuthentication(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
}
