package com.comichub.backend;

import com.comichub.dto.auth.LoginRequest;
import com.comichub.dto.auth.LoginResponse;
import com.comichub.dto.auth.LogoutRequest;
import com.comichub.dto.auth.RefreshTokenRequest;
import com.comichub.entity.User;
import com.comichub.repository.UserRepository;
import com.comichub.security.JwtService;
import com.comichub.service.AuthService;
import com.comichub.service.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private RefreshTokenService refreshTokenService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                authenticationManager,
                userRepository,
                jwtService,
                refreshTokenService,
                3_600_000L);
    }

    @Test
    void loginIssuesAccessAndRefreshTokens() {
        User user = user(11L, "reader");
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("reader")
                .password("encoded")
                .authorities("ROLE_USER")
                .build();
        Authentication authenticated = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenReturn(authenticated);
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken("reader")).thenReturn("access.jwt");
        when(refreshTokenService.issue(user))
                .thenReturn(new RefreshTokenService.IssuedRefreshToken("refresh", 604_800_000L));

        LoginResponse response = authService.login(new LoginRequest("reader", "password"));

        assertEquals("access.jwt", response.accessToken());
        assertEquals("refresh", response.refreshToken());
        assertEquals(3_600_000L, response.expiresIn());
        assertEquals(604_800_000L, response.refreshExpiresIn());
        verify(userRepository).findByUsername("reader");
    }

    @Test
    void refreshReturnsNewTokenPair() {
        User user = user(11L, "reader");
        when(refreshTokenService.rotate("old-refresh"))
                .thenReturn(new RefreshTokenService.RotatedRefreshToken(
                        user, "new-refresh", 604_800_000L));
        when(jwtService.generateAccessToken("reader")).thenReturn("new-access.jwt");

        LoginResponse response = authService.refresh(new RefreshTokenRequest("old-refresh"));

        assertEquals("new-access.jwt", response.accessToken());
        assertEquals("new-refresh", response.refreshToken());
    }

    @Test
    void logoutRevokesRefreshTokenForAuthenticatedUser() {
        when(userRepository.findByUsername("reader")).thenReturn(Optional.of(user(11L, "reader")));

        authService.logout(new LogoutRequest("refresh"), "reader");

        verify(refreshTokenService).revoke("refresh", 11L);
    }

    private User user(Long id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setDisplayName("Reader");
        user.setStatus("ACTIVE");
        return user;
    }
}
