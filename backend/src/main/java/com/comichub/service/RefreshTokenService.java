/**
 * DỰ ÁN: ComicHub
 * FILE: RefreshTokenService.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Xử lý nghiệp vụ cho chức năng RefreshToken.
 * TRẠNG THÁI: CHƯA TRIỂN KHAI — file khung, chưa có mã chức năng.
 * CÒN THIẾU: Cần bổ sung implementation theo API contract và kiểm thử; cập nhật trạng thái sau khi hoàn thành.
 * LƯU Ý: Triển khai validation nghiệp vụ, ownership/trạng thái, lỗi và transaction khi cần; phối hợp schema/API contract.
 */

package com.comichub.service;

import com.comichub.entity.RefreshToken;
import com.comichub.entity.User;
import com.comichub.exception.RefreshTokenRejectedException;
import com.comichub.exception.RefreshTokenReuseException;
import com.comichub.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final long expirationMs;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${app.jwt.refresh-expiration-ms}") long expirationMs) {
        if (expirationMs <= 0) {
            throw new IllegalArgumentException("Refresh token expiry phải lớn hơn 0");
        }
        this.refreshTokenRepository = refreshTokenRepository;
        this.expirationMs = expirationMs;
    }

    @Transactional
    public IssuedRefreshToken issue(User user) {
        String rawToken = generateToken();
        LocalDateTime now = LocalDateTime.now();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(hashToken(rawToken));
        refreshToken.setCreatedAt(now);
        refreshToken.setExpiresAt(now.plus(expirationMs, ChronoUnit.MILLIS));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);

        return new IssuedRefreshToken(rawToken, expirationMs);
    }

    @Transactional(noRollbackFor = RefreshTokenRejectedException.class)
    public RotatedRefreshToken rotate(String rawToken) {
        if (rawToken == null || rawToken.isBlank() || rawToken.length() > 128) {
            throw new BadCredentialsException("Refresh token không hợp lệ");
        }

        RefreshToken current = refreshTokenRepository
                .findByTokenForUpdate(hashToken(rawToken))
                .orElseThrow(() -> new BadCredentialsException("Refresh token không hợp lệ"));

        if (Boolean.TRUE.equals(current.getRevoked())) {
            refreshTokenRepository.revokeAllActiveByUserId(current.getUser().getId());
            throw new RefreshTokenReuseException();
        }

        if (!current.getExpiresAt().isAfter(LocalDateTime.now())
                || !"ACTIVE".equalsIgnoreCase(current.getUser().getStatus())) {
            refreshTokenRepository.revokeAllActiveByUserId(current.getUser().getId());
            throw new RefreshTokenRejectedException();
        }

        current.setRevoked(true);
        refreshTokenRepository.save(current);
        IssuedRefreshToken replacement = issue(current.getUser());
        return new RotatedRefreshToken(current.getUser(), replacement.token(), expirationMs);
    }

    @Transactional
    public void revoke(String rawToken, Long userId) {
        if (rawToken == null || rawToken.isBlank() || rawToken.length() > 128
                || userId == null) {
            return;
        }

        refreshTokenRepository.findByTokenForUpdate(hashToken(rawToken))
                .filter(token -> token.getUser().getId().equals(userId))
                .filter(token -> !Boolean.TRUE.equals(token.getRevoked()))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public record IssuedRefreshToken(String token, long expiresIn) {
    }

    public record RotatedRefreshToken(User user, String token, long expiresIn) {
    }
}
