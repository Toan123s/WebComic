package com.comichub.backend;

import com.comichub.security.CustomUserDetailsService;
import com.comichub.security.JwtAuthenticationFilter;
import com.comichub.security.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {

    private static final String SECRET = Base64.getEncoder()
            .encodeToString("0123456789abcdef0123456789abcdef".getBytes());

    private JwtService jwtService;
    private CustomUserDetailsService userDetailsService;
    private TestJwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 60_000);
        userDetailsService = mock(CustomUserDetailsService.class);
        filter = new TestJwtAuthenticationFilter(jwtService, userDetailsService);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void acceptsCaseInsensitiveBearerSchemeAndSetsAuthentication()
            throws ServletException, IOException {
        UserDetails user = org.springframework.security.core.userdetails.User
                .withUsername("reader")
                .password("unused")
                .authorities("ROLE_USER")
                .build();
        when(userDetailsService.loadUserByUsername("reader")).thenReturn(user);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization",
                "bEaReR " + jwtService.generateAccessToken("reader"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.invoke(request, response, chain);

        assertEquals(200, response.getStatus());
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }

    @Test
    void rejectsMalformedBearerToken() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.invoke(request, response, chain);

        assertEquals(401, response.getStatus());
        verify(chain, never()).doFilter(request, response);
    }

    @Test
    void letsRequestsWithoutBearerCredentialsContinue()
            throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.invoke(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    private static class TestJwtAuthenticationFilter extends JwtAuthenticationFilter {

        private TestJwtAuthenticationFilter(
                JwtService jwtService,
                CustomUserDetailsService userDetailsService) {
            super(jwtService, userDetailsService);
        }

        private void invoke(
                MockHttpServletRequest request,
                MockHttpServletResponse response,
                FilterChain chain) throws ServletException, IOException {
            doFilterInternal(request, response, chain);
        }
    }
}
