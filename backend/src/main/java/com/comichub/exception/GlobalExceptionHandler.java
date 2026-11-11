
package com.comichub.exception;


/**
 * DỰ ÁN: ComicHub
 * FILE: GlobalExceptionHandler.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Xử lý ngoại lệ backend: GlobalExceptionHandler.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — chưa kết luận hoàn thành; cần kiểm thử theo task.
 * CÒN THIẾU: Cần xác nhận tiêu chí hoàn thành, kiểm thử phù hợp và cập nhật trạng thái sau khi hoàn tất.
 * LƯU Ý: Response lỗi không được lộ stack trace, secret, token hoặc password hash.
 */

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(
            ResourceNotFoundException exception) {

        return ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                exception.getMessage()
        );
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ProblemDetail handleDuplicate(
            DuplicateResourceException exception) {

        return ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                exception.getMessage()
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleBadRequest(
            IllegalArgumentException exception) {

        return ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                exception.getMessage()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(
            MethodArgumentNotValidException exception) {

        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": "
                        + error.getDefaultMessage())
                .findFirst()
                .orElse("Dữ liệu đầu vào không hợp lệ");

        return ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                message
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException exception) {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.FORBIDDEN,
                "Bạn không có quyền thực hiện thao tác này"
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataConflict(DataIntegrityViolationException exception) {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                "Dữ liệu xung đột với một bản ghi hiện có"
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    public ProblemDetail handleAuthentication(AuthenticationException exception) {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED,
                "Thông tin xác thực không hợp lệ"
        );
    }
}
