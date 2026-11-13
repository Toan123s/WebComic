/**
 * DỰ ÁN: ComicHub
 * FILE: SecurityConfig.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Cấu hình Spring Security và quy tắc truy cập.
 * TRẠNG THÁI: ĐÃ CẤU HÌNH PUBLIC/PROTECTED VÀ STATUS 401/403.
 * CÒN THIẾU: Cần tiếp tục rà soát khi bổ sung endpoint mới.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */


package com.comichub.config;

import com.comichub.security.CustomUserDetailsService;
import com.comichub.security.JwtAuthenticationFilter;
import com.comichub.security.JwtService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public AuthenticationProvider authenticationProvider(
            CustomUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationProvider authenticationProvider,
            JwtService jwtService,
            CustomUserDetailsService userDetailsService)
            throws Exception {

        JwtAuthenticationFilter jwtAuthenticationFilter =
                new JwtAuthenticationFilter(
                        jwtService,
                        userDetailsService
                );
        AuthenticationEntryPoint authenticationEntryPoint =
                (request, response, exception) -> response.sendError(
                        401, "Cần xác thực để truy cập tài nguyên này");
        AccessDeniedHandler accessDeniedHandler =
                (request, response, exception) -> response.sendError(
                        403, "Bạn không có quyền thực hiện thao tác này");

        http
                // API sử dụng JWT nên tắt CSRF cho cấu hình stateless này
                .csrf(csrf -> csrf.disable())

                // Cấu hình xác thực username/password
                .authenticationProvider(authenticationProvider)

                // Không lưu phiên đăng nhập trên server
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Cấu hình quyền truy cập
                .authorizeHttpRequests(auth -> auth

                        // Cho phép đăng nhập mà chưa cần JWT
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login",
                                "/api/auth/refresh"
                        ).permitAll()

                        // Public registration creates only the default USER role.
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users"
                        ).permitAll()

                        // Public reads; service methods still filter non-public resources.
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/comics",
                                "/api/comics/search",
                                "/api/comics/*",
                                "/api/comics/*/chapters",
                                "/api/comics/*/categories",
                                "/api/chapters/*",
                                "/api/chapters/*/pages",
                                "/api/chapter-pages/*/image",
                                "/api/categories",
                                "/api/categories/*"
                        ).permitAll()

                        // Những API còn lại phải đăng nhập
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))

                // Chạy JWT filter trước filter xác thực username/password
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
