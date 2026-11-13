package com.comichub.backend;

import com.comichub.entity.User;
import com.comichub.repository.UserRepository;
import com.comichub.repository.UserRoleRepository;
import com.comichub.security.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserRoleRepository userRoleRepository;
    @InjectMocks
    private CustomUserDetailsService service;

    @Test
    void loadsDatabaseRolesAsSpringAuthorities() {
        User user = new User();
        user.setId(7L);
        user.setUsername("creator");
        user.setPasswordHash("hash");
        user.setStatus("ACTIVE");
        when(userRepository.findByUsername("creator")).thenReturn(Optional.of(user));
        when(userRoleRepository.findRoleNamesByUserId(7L))
                .thenReturn(List.of("AUTHOR", "USER"));

        UserDetails details = service.loadUserByUsername("creator");

        assertTrue(details.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_AUTHOR")));
        assertTrue(details.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_USER")));
    }

    @Test
    void ignoresRolesOutsideTheFourSupportedRoles() {
        User user = new User();
        user.setId(8L);
        user.setUsername("unassigned");
        user.setPasswordHash("hash");
        user.setStatus("ACTIVE");
        when(userRepository.findByUsername("unassigned")).thenReturn(Optional.of(user));
        when(userRoleRepository.findRoleNamesByUserId(8L))
                .thenReturn(List.of("GUEST", "SUPER_ADMIN", " "));

        UserDetails details = service.loadUserByUsername("unassigned");

        assertTrue(details.getAuthorities().isEmpty());
    }

    @Test
    void disabledDatabaseAccountIsNotEnabled() {
        User user = new User();
        user.setId(9L);
        user.setUsername("disabled");
        user.setPasswordHash("hash");
        user.setStatus("DISABLED");
        when(userRepository.findByUsername("disabled")).thenReturn(Optional.of(user));
        when(userRoleRepository.findRoleNamesByUserId(9L)).thenReturn(List.of("USER"));

        UserDetails details = service.loadUserByUsername("disabled");

        assertFalse(details.isEnabled());
    }
}
