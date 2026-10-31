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
import com.comichub.entity.User;
import com.comichub.repository.UserRepository;
import com.comichub.security.JwtService;

import org.springframework.beans.factory.annotation.Value;
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
    private final long expirationMs;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {

        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
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

        // Bước 5: Cập nhật thời điểm đăng nhập gần nhất
        user.setLastLoginAt(LocalDateTime.now());

        // Bước 6: Trả thông tin đăng nhập về client
        return new LoginResponse(
                accessToken,
                "Bearer",
                expirationMs,
                user.getId(),
                user.getUsername(),
                user.getDisplayName()
        );
    }
}
