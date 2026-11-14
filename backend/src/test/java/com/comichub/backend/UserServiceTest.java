package com.comichub.backend;

import com.comichub.dto.user.UserCreateRequest;
import com.comichub.entity.Role;
import com.comichub.entity.User;
import com.comichub.entity.UserRole;
import com.comichub.exception.ResourceNotFoundException;
import com.comichub.exception.DuplicateResourceException;
import com.comichub.mapper.UserMapper;
import com.comichub.repository.FollowRepository;
import com.comichub.repository.RoleRepository;
import com.comichub.repository.UserRepository;
import com.comichub.repository.UserRoleRepository;
import com.comichub.service.UserService;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private UserRoleRepository userRoleRepository;
    @Mock
    private FollowRepository followRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void registrationAssignsOnlyTheDatabaseUserRole() {
        Role userRole = new Role();
        userRole.setId(1);
        userRole.setName("USER");
        when(userRepository.existsByUsername("reader")).thenReturn(false);
        when(userRepository.existsByEmail("reader@example.test")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));

        userService.createUser(new UserCreateRequest(
                "reader", "reader@example.test", "password123", null, null, null));

        verify(userRoleRepository).save(any(UserRole.class));
        verify(roleRepository).findByName("USER");
    }

    @Test
    void registrationFailsExplicitlyWhenDefaultRoleIsMissing() {
        when(userRepository.existsByUsername("reader")).thenReturn(false);
        when(userRepository.existsByEmail("reader@example.test")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(roleRepository.findByName("USER")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.createUser(new UserCreateRequest(
                        "reader", "reader@example.test", "password123",
                        null, null, null)));
        verify(userRoleRepository, never()).save(any(UserRole.class));
    }

    @Test
    void userCannotReadAnotherUsersRecord() {
        User owner = user(2L, "other");
        setAuthentication("reader", "USER");
        when(userRepository.findById(2L)).thenReturn(Optional.of(owner));
        when(userRepository.findByUsername("reader"))
                .thenReturn(Optional.of(user(1L, "reader")));

        assertThrows(AccessDeniedException.class, () -> userService.getUserById(2L));
    }

    @Test
    void nonAdminCannotListAllUsersEvenThroughService() {
        setAuthentication("reader", "USER");

        assertThrows(AccessDeniedException.class, userService::getAllUsers);
        verify(userRepository, never()).findAll();
    }

    @Test
    void cannotDeleteTheLastActiveAdminAccount() {
        User admin = user(1L, "admin");
        admin.setStatus("ACTIVE");
        setAuthentication("admin", "ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(userRoleRepository.findRoleNamesByUserId(1L)).thenReturn(List.of("ADMIN"));
        when(userRoleRepository.countByRole_NameAndUser_Status("ADMIN", "ACTIVE"))
                .thenReturn(1L);

        assertThrows(DuplicateResourceException.class,
                () -> userService.deleteUser(1L));
        verify(userRepository, never()).delete(admin);
    }

    @Test
    void deletingCreatorRemovesCreatorFollowsBeforeDeletingTheAccount() {
        User creator = user(2L, "creator");
        setAuthentication("admin", "ADMIN");
        when(userRepository.findById(2L)).thenReturn(Optional.of(creator));

        userService.deleteUser(2L);

        verify(followRepository).deleteByCreator_Id(2L);
        verify(userRepository).delete(creator);
    }

    @Test
    void currentUserCanReadAndUpdateTheirOwnProfile() {
        User reader = user(2L, "reader");
        setAuthentication("reader", "USER");
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(reader));
        when(userRepository.existsByUsernameAndIdNot("reader-new", 2L)).thenReturn(false);
        when(userRepository.existsByEmailAndIdNot("reader-new@example.test", 2L))
                .thenReturn(false);
        when(userRepository.save(reader)).thenReturn(reader);

        userService.getCurrentUserProfile();
        userService.updateCurrentUserProfile(new com.comichub.dto.user.UserUpdateRequest(
                "reader-new", "reader-new@example.test", "Reader", null, null));

        verify(userMapper, org.mockito.Mockito.times(2)).toResponse(reader);
        verify(userRepository).save(reader);
    }

    @Test
    void currentUserProfileRequiresAnAuthenticatedPrincipal() {
        assertThrows(AccessDeniedException.class, userService::getCurrentUserProfile);
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        return user;
    }

    private void setAuthentication(String username, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        username,
                        "token",
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }
}
