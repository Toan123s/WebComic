/**
 * DỰ ÁN: ComicHub
 * FILE: RoleRepository.java
 * PHỤ TRÁCH: TV1 - Backend
 * MỤC ĐÍCH: Truy vấn persistence cho Role.
 * TRẠNG THÁI: ĐÃ TRIỂN KHAI TRUY VẤN ROLE THEO TÊN.
 * CÒN THIẾU: Role management HTTP chưa được triển khai.
 * LƯU Ý: Chỉ xử lý truy vấn dữ liệu; nghiệp vụ và ownership thuộc Service.
 */

package com.comichub.repository;

import com.comichub.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByName(String name);

    List<Role> findAllByOrderByNameAsc();
}
