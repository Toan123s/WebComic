package com.comichub.backend;

import com.comichub.entity.RefreshToken;
import com.comichub.entity.User;
import com.comichub.exception.RefreshTokenReuseException;
import com.comichub.exception.RefreshTokenRejectedException;
import com.comichub.repository.RefreshTokenRepository;
import com.comichub.service.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, 604_800_000L);
    }

    @Test
    void storesOnlyHashAndReturnsOpaqueToken() throws NoSuchAlgorithmException {
        User user = activeUser(4L);
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        RefreshTokenService.IssuedRefreshToken issued = refreshTokenService.issue(user);

        ArgumentCaptor<RefreshToken> stored = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(stored.capture());
        assertNotEquals(issued.token(), stored.getValue().getToken());
        assertEquals(hash(issued.token()), stored.getValue().getToken());
        assertEquals(604_800_000L, issued.expiresIn());
    }

    @Test
    void reuseOfRotatedTokenRevokesAllActiveRefreshSessions() {
        User user = activeUser(4L);
        RefreshToken revokedToken = refreshToken(user, "digest", true);
        when(refreshTokenRepository.findByTokenForUpdate(any()))
                .thenReturn(Optional.of(revokedToken));

        assertThrows(RefreshTokenReuseException.class,
                () -> refreshTokenService.rotate("previous-token"));

        verify(refreshTokenRepository).revokeAllActiveByUserId(4L);
    }

    @Test
    void inactiveAccountCannotRefreshAndItsSessionsAreRevoked() {
        User user = activeUser(4L);
        user.setStatus("BANNED");
        RefreshToken token = refreshToken(user, "digest", false);
        when(refreshTokenRepository.findByTokenForUpdate(any()))
                .thenReturn(Optional.of(token));

        assertThrows(RefreshTokenRejectedException.class,
                () -> refreshTokenService.rotate("session-token"));

        verify(refreshTokenRepository).revokeAllActiveByUserId(4L);
    }

    @Test
    void successfulRefreshRevokesOldTokenAndIssuesReplacement() throws NoSuchAlgorithmException {
        User user = activeUser(4L);
        RefreshToken oldToken = refreshToken(user, "old-digest", false);
        when(refreshTokenRepository.findByTokenForUpdate(any()))
                .thenReturn(Optional.of(oldToken));
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RefreshTokenService.RotatedRefreshToken rotated =
                refreshTokenService.rotate("old-token");

        ArgumentCaptor<RefreshToken> stored = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository, org.mockito.Mockito.times(2)).save(stored.capture());
        assertTrue(oldToken.getRevoked());
        assertEquals(user, rotated.user());
        assertNotEquals("old-token", rotated.token());
        assertEquals(hash(rotated.token()), stored.getAllValues().get(1).getToken());
    }

    @Test
    void logoutRevokesOnlyTokenBelongingToAuthenticatedUser() {
        User owner = activeUser(4L);
        RefreshToken ownedToken = refreshToken(owner, "digest", false);
        when(refreshTokenRepository.findByTokenForUpdate(any()))
                .thenReturn(Optional.of(ownedToken));
        refreshTokenService.revoke("session-token", 4L);

        assertTrue(ownedToken.getRevoked());
        verify(refreshTokenRepository).save(ownedToken);
    }

    @Test
    void logoutDoesNotRevokeAnotherUsersToken() {
        User owner = activeUser(4L);
        RefreshToken ownedToken = refreshToken(owner, "digest", false);
        when(refreshTokenRepository.findByTokenForUpdate(any()))
                .thenReturn(Optional.of(ownedToken));
        refreshTokenService.revoke("session-token", 8L);

        assertFalse(ownedToken.getRevoked());
    }

    private User activeUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setUsername("reader");
        user.setStatus("ACTIVE");
        return user;
    }

    private RefreshToken refreshToken(User user, String digest, boolean revoked) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(digest);
        refreshToken.setRevoked(revoked);
        refreshToken.setExpiresAt(java.time.LocalDateTime.now().plusDays(1));
        return refreshToken;
    }

    private String hash(String token) throws NoSuchAlgorithmException {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8)));
    }
}
