# 06 — Decisions Log

## Trạng thái
- **Accepted:** đã thống nhất.
- **To verify:** hướng đã thống nhất nhưng cần xác minh code/schema.
- **Proposed:** đề xuất chưa chốt.
- **Open:** còn câu hỏi.
- **Deferred:** để giai đoạn sau.

## D-001 — Backend
Java, Spring Boot và Spring MVC. **Trạng thái: Accepted.**

## D-002 — Frontend
React, TypeScript và Vite. **Trạng thái: Accepted.**

## D-003 — Database
Microsoft SQL Server. **Trạng thái: Accepted.**

## D-004 — Ba khu vực UI
Reader, Creator Studio, Admin; không đồng nghĩa số role database. **Trạng thái: Accepted.**

## D-005 — Đọc công khai
Nội dung truyện đã công khai có thể đọc không cần đăng nhập; chức năng cá nhân theo policy auth. **Trạng thái: Accepted; chi tiết từng API cần khớp contract.**

## D-006 — JWT
JWT là hướng xác thực chính; Basic Auth không phải cơ chế đăng nhập chính của sản phẩm. **Trạng thái: Accepted về thiết kế; To verify về triển khai.**

## D-007 — Bảo toàn code
Đọc và hiểu trước khi sửa; ưu tiên thay đổi nhỏ. **Trạng thái: Accepted.**

## D-008 — Phân công
TV1 Backend/Security; TV2 Frontend; TV3 Database/Testing/Integration. **Trạng thái: Accepted.**

## D-009 — API contract
Thống nhất endpoint, request, response, status và quyền trước tích hợp. **Trạng thái: Accepted về nguyên tắc; chi tiết endpoint cần xác nhận.**

## D-010 — Xóa dữ liệu
Không mặc định soft delete cho mọi bảng; chốt policy từng bảng/quan hệ/khôi phục. **Trạng thái: Open.**

## D-011 — Locking
Không áp dụng optimistic/pessimistic locking đại trà; chỉ dùng khi có nhu cầu và schema phù hợp. **Trạng thái: Open.**

## D-012 — Refresh/logout
Chốt việc có triển khai, nơi lưu, expiry, rotation/revoke, logout và lưu token client. **Trạng thái: Open; chưa được xem là hoàn thành.**

## D-013 — Upload ảnh
Cần luồng upload ảnh và metadata nhất quán; chốt storage, giới hạn, đường dẫn và xử lý lỗi. **Trạng thái: Proposed/Open.**

## D-014 — Pagination/error
Chốt page index, response phân trang và format lỗi phù hợp code hiện tại. **Trạng thái: Open.**

## Mẫu quyết định mới
### D-XXX — Tên quyết định
- Ngày:
- Bối cảnh:
- Các phương án:
- Quyết định/lý do:
- Ảnh hưởng tới file/API/schema/UI:
- Người xác nhận:
- Trạng thái: Proposed / Accepted / To verify / Open / Deferred

## D-015 — Phối hợp API contract TV1/TV2/TV3
- Quyết định: TV1 và TV2 thống nhất endpoint, request/response JSON, validation, status code, error format và quyền trước tích hợp; TV3 review và viết test từ contract. TV2 được dùng mock data trước khi API thật sẵn sàng nhưng phải ghi rõ mock.
- Thay đổi: không tự ý sửa contract; cần xác nhận của các bên bị ảnh hưởng và cập nhật tài liệu/test.
- Trạng thái: Accepted về quy trình; từng endpoint vẫn cần xác nhận riêng.

## D-016 — Thay đổi schema và dữ liệu dùng chung TV1/TV3
- Quyết định: TV3 chủ trì schema/seed; TV1 đối chiếu Entity/Repository. Thay đổi bảng/cột/kiểu/PK/FK/constraint/trạng thái/seed phải được hai bên review trước khi áp dụng.
- Trạng thái: Accepted về quy trình; chi tiết schema change cần review theo từng đề xuất.

## D-017 — Test trước khi API hoàn thành
- Quyết định: TV3 được viết test từ contract trước; test chưa chạy với endpoint thật phải ghi BLOCKED/chưa xác minh, không đánh dấu PASS. Khi API sẵn sàng phải chạy lại và lưu bằng chứng.
- Trạng thái: Accepted.

## D-018 — Không tự ý đổi hợp đồng dùng chung
- Quyết định: API contract, schema, role/permission và business rule đã chốt chỉ được đổi sau khi nêu tác động và nhận xác nhận của các bên bị ảnh hưởng; cập nhật tài liệu và test liên quan.
- Trạng thái: Accepted.
