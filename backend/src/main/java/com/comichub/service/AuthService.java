/**
 * DỰ ÁN: ComicHub
 * FILE: AuthService.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Nghiệp vụ đăng nhập và phát hành JWT.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH.
 * CÒN THIẾU: Kiểm thử tài khoản không tồn tại/mật khẩu sai/token; xác minh cập nhật lastLoginAt.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */


package com.comichub.service;

import com.comichub.dto.auth.LoginRequest;
import com.comichub.dto.auth.LoginResponse;
import com.comichub.dto.auth.LogoutRequest;
import com.comichub.dto.auth.RefreshTokenRequest;
import com.comichub.entity.User;
import com.comichub.exception.RefreshTokenRejectedException;
import com.comichub.repository.UserRepository;
import com.comichub.security.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final long expirationMs;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {

        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.expirationMs = expirationMs;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {

        // Bước 1: Xác thực username/email và mật khẩu
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.usernameOrEmail(),
                                request.password()
                        )
                );

        // Bước 2: Lấy thông tin tài khoản đã xác thực
        UserDetails userDetails =
                (UserDetails) authentication.getPrincipal();

        // Bước 3: Lấy entity User từ database
        User user = userRepository
                .findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Không tìm thấy tài khoản sau khi xác thực"
                ));

        // Bước 4: Tạo access token JWT
        String accessToken =
                jwtService.generateAccessToken(user.getUsername());

        RefreshTokenService.IssuedRefreshToken refreshToken =
                refreshTokenService.issue(user);

        user.setLastLoginAt(LocalDateTime.now());

        return createTokenResponse(user, accessToken, refreshToken.token(),
                refreshToken.expiresIn());
    }

    @Transactional(noRollbackFor = RefreshTokenRejectedException.class)
    public LoginResponse refresh(RefreshTokenRequest request) {
        RefreshTokenService.RotatedRefreshToken rotated =
                refreshTokenService.rotate(request.refreshToken());

        User user = rotated.user();
        return createTokenResponse(
                user,
                jwtService.generateAccessToken(user.getUsername()),
                rotated.token(),
                rotated.expiresIn());
    }

    @Transactional
    public void logout(LogoutRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Tài khoản không hợp lệ"));
        refreshTokenService.revoke(request.refreshToken(), user.getId());
    }

    private LoginResponse createTokenResponse(
            User user,
            String accessToken,
            String refreshToken,
            long refreshExpiresIn) {
        return new LoginResponse(
                accessToken,
                refreshToken,
                "Bearer",
                expirationMs,
                refreshExpiresIn,
                user.getId(),
                user.getUsername(),
                user.getDisplayName());
    }
}
