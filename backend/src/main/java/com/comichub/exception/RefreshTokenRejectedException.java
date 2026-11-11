package com.comichub.exception;

import org.springframework.security.authentication.BadCredentialsException;

public class RefreshTokenRejectedException extends BadCredentialsException {

    public RefreshTokenRejectedException() {
        super("Refresh token không hợp lệ");
    }
}
