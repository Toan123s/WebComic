/**
 * DỰ ÁN: ComicHub
 * FILE: AuthController.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Tiếp nhận HTTP cho đăng nhập.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH.
 * CÒN THIẾU: Kiểm thử POST /api/auth/login với dữ liệu hợp lệ/không hợp lệ và response theo contract.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */


package com.comichub.controller;

import com.comichub.dto.auth.LoginRequest;
import com.comichub.dto.auth.LoginResponse;
import com.comichub.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }
}
