/* =====================================================================
   ComicHub - Dữ liệu mẫu: 4 vai trò
   Chạy SAU khi đã chạy database/schema/create_tables.sql
   (Guest không có trong database vì chỉ là người chưa đăng nhập)
   ===================================================================== */

USE comichub;
GO

INSERT INTO roles (name, description) VALUES
    ('USER',      N'Người dùng thường: comment, rating, bookmark, follow, report'),
    ('AUTHOR',    N'Tác giả: tạo và quản lý truyện/chapter của mình'),
    ('MODERATOR', N'Kiểm duyệt truyện và bình luận'),
    ('ADMIN',     N'Quản trị toàn hệ thống');
GO

SELECT * FROM roles;
GO