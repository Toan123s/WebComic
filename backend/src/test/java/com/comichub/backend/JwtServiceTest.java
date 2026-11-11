package com.comichub.backend;

import com.comichub.security.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = Base64.getEncoder()
            .encodeToString("0123456789abcdef0123456789abcdef".getBytes());
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 60_000);
    }

    @Test
    void validatesIssuedAccessTokenForMatchingUser() {
        String token = jwtService.generateAccessToken("reader");

        assertTrue(jwtService.isTokenValid(token, user("reader")));
        assertFalse(jwtService.isTokenValid(token, user("another-reader")));
    }

    @Test
    void rejectsTamperedToken() {
        String token = jwtService.generateAccessToken("reader");
        String tamperedToken = token.substring(0, token.length() - 2) + "aa";

        assertFalse(jwtService.isTokenValid(tamperedToken, user("reader")));
    }

    @Test
    void rejectsExpiredToken() throws InterruptedException {
        JwtService shortLivedService = new JwtService(SECRET, 1);
        String token = shortLivedService.generateAccessToken("reader");
        Thread.sleep(5);

        assertFalse(shortLivedService.isTokenValid(token, user("reader")));
    }

    @Test
    void rejectsTokenWithoutExpectedIssuerAndTokenUse() {
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET));
        String token = Jwts.builder()
                .subject("reader")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();

        assertFalse(jwtService.isTokenValid(token, user("reader")));
    }

    @Test
    void rejectsWeakSigningKeysAndNonPositiveExpiry() {
        String weakSecret = Base64.getEncoder().encodeToString(new byte[16]);

        assertThrows(IllegalArgumentException.class, () -> new JwtService(weakSecret, 60_000));
        assertThrows(IllegalArgumentException.class, () -> new JwtService(SECRET, 0));
    }

    private org.springframework.security.core.userdetails.UserDetails user(String username) {
        return User.withUsername(username).password("unused").authorities("ROLE_USER").build();
    }
}
