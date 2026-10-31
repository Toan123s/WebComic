/**
 * DỰ ÁN: ComicHub
 * FILE: BackendApplication.java
 * PHỤ TRÁCH: TV1 - Backend và Security
 * MỤC ĐÍCH: Điểm khởi chạy ứng dụng Spring Boot.
 * TRẠNG THÁI: ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH.
 * CÒN THIẾU: Cần xác nhận ứng dụng khởi động và các bean/cấu hình nạp thành công.
 * LƯU Ý: Header mô tả trạng thái đọc từ mã nguồn; không thay thế review hoặc bằng chứng kiểm thử.
 */

package com.comichub;

import org.springframework.boot.SpringApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@EnableJpaAuditing
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
