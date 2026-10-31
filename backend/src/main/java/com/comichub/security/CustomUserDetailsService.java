/**
 * DỰ ÁN: ComicHub
 * FILE: CustomUserDetailsService.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Nạp tài khoản cho Spring Security.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH.
 * CÒN THIẾU: Kiểm thử tìm theo username/email và trường hợp không tìm thấy; rà lại lỗi login.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */


package com.comichub.security;

import com.comichub.entity.User;
import com.comichub.repository.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {

        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy tài khoản: " + username
                ));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .authorities(List.of())
                .disabled(!"ACTIVE".equalsIgnoreCase(user.getStatus()))
                .build();
    }
}
