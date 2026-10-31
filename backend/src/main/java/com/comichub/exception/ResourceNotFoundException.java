
package com.comichub.exception;


/**
 * DỰ ÁN: ComicHub
 * FILE: ResourceNotFoundException.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Xử lý ngoại lệ backend: ResourceNotFoundException.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — chưa kết luận hoàn thành; cần kiểm thử theo task.
 * CÒN THIẾU: Cần xác nhận tiêu chí hoàn thành, kiểm thử phù hợp và cập nhật trạng thái sau khi hoàn tất.
 * LƯU Ý: Response lỗi không được lộ stack trace, secret, token hoặc password hash.
 */

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
