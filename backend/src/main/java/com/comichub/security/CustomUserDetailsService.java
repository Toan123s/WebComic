/**
 * DỰ ÁN: ComicHub
 * FILE: CustomUserDetailsService.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Nạp tài khoản cho Spring Security.
 * TRẠNG THÁI: ĐỌC ROLE TỪ DATABASE, CHỈ CẤP BỐN ROLE ĐƯỢC HỖ TRỢ.
 * CÒN THIẾU: Role management HTTP chưa được triển khai.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */


package com.comichub.security;

import com.comichub.entity.User;
import com.comichub.repository.UserRepository;
import com.comichub.repository.UserRoleRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Set;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Set<String> ALLOWED_ROLES =
            Set.of("USER", "AUTHOR", "MODERATOR", "ADMIN");

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    public CustomUserDetailsService(
            UserRepository userRepository,
            UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
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
                .authorities(userRoleRepository.findRoleNamesByUserId(user.getId())
                        .stream()
                        .map(role -> role == null ? "" : role.trim().toUpperCase(Locale.ROOT))
                        .filter(ALLOWED_ROLES::contains)
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .toList())
                .disabled(!"ACTIVE".equalsIgnoreCase(user.getStatus()))
                .build();
    }
}
