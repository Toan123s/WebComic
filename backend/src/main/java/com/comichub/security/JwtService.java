/**
 * DỰ ÁN: ComicHub
 * FILE: JwtService.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Tạo và kiểm tra JWT.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH.
 * CÒN THIẾU: Kiểm thử chữ ký/expiry và đảm bảo secret chỉ lấy từ cấu hình an toàn.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */


package com.comichub.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Objects;

@Service
public class JwtService {

    private static final String ISSUER = "comichub";
    private static final String TOKEN_USE_CLAIM = "token_use";
    private static final String ACCESS_TOKEN_USE = "access";

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {

        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("JWT secret không được để trống");
        }
        if (expirationMs <= 0) {
            throw new IllegalArgumentException("Access token expiry phải lớn hơn 0");
        }
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException(
                    "JWT secret phải giải mã thành tối thiểu 32 bytes");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    // Tạo Access Token cho người dùng đã đăng nhập
    public String generateAccessToken(String username) {

        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .issuer(ISSUER)
                .subject(username)
                .claim(TOKEN_USE_CLAIM, ACCESS_TOKEN_USE)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(signingKey)
                .compact();
    }

    // Lấy username được lưu trong token
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // Kiểm tra token có hợp lệ với tài khoản hiện tại không
    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {

        try {
            Claims claims = extractClaims(token);

            return Objects.equals(claims.getSubject(), userDetails.getUsername())
                    && ACCESS_TOKEN_USE.equals(claims.get(TOKEN_USE_CLAIM, String.class))
                    && claims.getExpiration().after(new Date());

        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    // Giải mã và xác minh chữ ký token
    private Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(ISSUER)
                .require(TOKEN_USE_CLAIM, ACCESS_TOKEN_USE)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
