/**
 * DỰ ÁN: ComicHub
 * FILE: UserRoleRepository.java
 * PHỤ TRÁCH: TV1 - Backend
 * MỤC ĐÍCH: Truy vấn persistence cho UserRole.
 * TRẠNG THÁI: CHƯA TRIỂN KHAI — file khung, chưa có mã chức năng.
 * CÒN THIẾU: Cần bổ sung implementation theo API contract và kiểm thử; cập nhật trạng thái sau khi hoàn thành.
 * LƯU Ý: Chỉ xử lý truy vấn dữ liệu; nghiệp vụ và ownership thuộc Service.
 */

package com.comichub.repository;

import com.comichub.entity.UserRole;
import com.comichub.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    @Query("select userRole.role.name from UserRole userRole where userRole.user.id = :userId")
    List<String> findRoleNamesByUserId(@Param("userId") Long userId);
}
