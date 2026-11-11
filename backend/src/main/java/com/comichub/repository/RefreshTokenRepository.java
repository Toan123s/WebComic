/**
 * DỰ ÁN: ComicHub
 * FILE: RefreshTokenRepository.java
 * PHỤ TRÁCH: TV1 - Backend
 * MỤC ĐÍCH: Truy vấn persistence cho RefreshToken.
 * TRẠNG THÁI: CHƯA TRIỂN KHAI — file khung, chưa có mã chức năng.
 * CÒN THIẾU: Cần bổ sung implementation theo API contract và kiểm thử; cập nhật trạng thái sau khi hoàn thành.
 * LƯU Ý: Chỉ xử lý truy vấn dữ liệu; nghiệp vụ và ownership thuộc Service.
 */

package com.comichub.repository;

import com.comichub.entity.RefreshToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select refreshToken from RefreshToken refreshToken join fetch refreshToken.user "
            + "where refreshToken.token = :token")
    Optional<RefreshToken> findByTokenForUpdate(@Param("token") String token);

    @Modifying
    @Query("update RefreshToken refreshToken set refreshToken.revoked = true "
            + "where refreshToken.user.id = :userId and refreshToken.revoked = false")
    int revokeAllActiveByUserId(@Param("userId") Long userId);
}
