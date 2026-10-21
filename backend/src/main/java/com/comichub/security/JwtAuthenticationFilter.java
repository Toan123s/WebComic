
package com.comichub.security;

import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Bước 1: Lấy Authorization header
        String authHeader = request.getHeader("Authorization");

        // Bước 2: Không có Bearer token thì để Spring Security xử lý tiếp
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Bước 3: Tách JWT khỏi "Bearer "
        String jwt = authHeader.substring(7);

        // Bước 4: Đọc username và xác minh token
        String username;

        try {
            username = jwtService.extractUsername(jwt);
        } catch (JwtException | IllegalArgumentException exception) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Access token không hợp lệ hoặc đã hết hạn"
            );
            return;
        }

        // Bước 5: Chỉ xác thực khi request chưa có Authentication
        if (username != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            try {
                // Bước 6: Tải tài khoản từ database
                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(username);

                // Bước 7: Kiểm tra tài khoản và token
                if (!userDetails.isEnabled()
                        || !jwtService.isTokenValid(jwt, userDetails)) {

                    response.sendError(
                            HttpServletResponse.SC_UNAUTHORIZED,
                            "Access token không hợp lệ hoặc tài khoản không hoạt động"
                    );
                    return;
                }

                // Bước 8: Tạo Authentication cho người dùng
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // Bước 9: Gắn thông tin request
                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                // Bước 10: Lưu Authentication vào SecurityContext
                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

            } catch (UsernameNotFoundException exception) {
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Tài khoản không tồn tại"
                );
                return;
            }
        }

        // Bước 11: Tiếp tục chuỗi filter
        filterChain.doFilter(request, response);
    }
}
