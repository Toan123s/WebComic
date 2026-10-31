
package com.comichub.exception;


/**
 * DỰ ÁN: ComicHub
 * FILE: DuplicateResourceException.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Xử lý ngoại lệ backend: DuplicateResourceException.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — chưa kết luận hoàn thành; cần kiểm thử theo task.
 * CÒN THIẾU: Cần xác nhận tiêu chí hoàn thành, kiểm thử phù hợp và cập nhật trạng thái sau khi hoàn tất.
 * LƯU Ý: Response lỗi không được lộ stack trace, secret, token hoặc password hash.
 */

public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
