# ComicHub — Kế hoạch làm việc nhóm

**Stack:** Spring Boot + Spring MVC/Security/JWT; React + TypeScript + Vite; Microsoft SQL Server.

## 1. Phân công
- **TV1 — Backend & Security:** `backend/src/main/java/com/comichub/`; API, nghiệp vụ, DTO, validation, exception, transaction, JWT, authorization và ownership.
- **TV2 — Frontend:** `frontend/src/`; React/TypeScript, routes, layouts, components, API client và ba khu vực Reader, Creator Studio, Admin.
- **TV3 — Database, Testing & Integration:** `database/`, schema, Postman, test cases, kiểm thử tích hợp và ghi nhận lỗi.

Mỗi task có một người chủ trì. Thay đổi ảnh hưởng phần người khác cần trao đổi và review.

## 2. Nguyên tắc chung
1. Đọc code, cấu hình và schema hiện tại trước khi sửa.
2. Ưu tiên thay đổi nhỏ; không viết lại hoặc đổi cấu trúc nếu chưa có lý do.
3. Danh sách file trong tài liệu là định hướng, **không phải yêu cầu tạo hết file ngay**.
4. Phân biệt rõ: đã triển khai, đã thống nhất nhưng chưa triển khai, đề xuất và chưa quyết định.
5. Backend thực thi bảo mật thật; frontend route guard chỉ hỗ trợ UX.
6. Không tin `userId`, `creatorId` hoặc role do client gửi để quyết định quyền.
7. Đối chiếu Entity với `database/schema/Create_Tables.sql` và role với `database/seed/Roles.sql`. Giữ `ddl-auto=validate` trừ khi nhóm thống nhất khác.
8. Không tự thêm cột/cơ chế như `deletedAt`, `isDeleted`, `@Version` nếu chưa thống nhất.
9. Dùng pagination/lọc phù hợp; tránh tải dữ liệu không cần thiết và N+1 query.
10. Transaction database không tự rollback thao tác filesystem; upload/xóa file cần xử lý lỗi riêng.
11. Không commit `.env`, token, mật khẩu, dữ liệu cá nhân, `target/`, `node_modules/` hoặc file upload riêng tư.
12. Không ghi chức năng là hoàn thành nếu chưa kiểm chứng.

## 3. Ranh giới layer backend
- **Controller:** HTTP mapping, request validation, gọi Service, trả response; không chứa nghiệp vụ phức tạp hoặc query trực tiếp.
- **Service:** nghiệp vụ, ownership, trạng thái, điều phối Repository và transaction khi cần.
- **Repository:** persistence; không quyết định quyền hoặc quy trình nghiệp vụ.
- **Entity:** ánh xạ schema; không trả trực tiếp nếu có nguy cơ lộ dữ liệu nội bộ.
- **DTO:** giới hạn dữ liệu API nhận/trả và validation đầu vào.
- **Mapper:** chuyển DTO/Entity; không chứa nghiệp vụ hoặc truy vấn DB.
- **Exception handler:** response lỗi thống nhất; không trả stack trace, password hash, token hay secret.

## 4. Quy tắc nghiệp vụ/bảo mật
- Public được đọc truyện đã công khai theo policy.
- Chức năng cá nhân cần tuân theo chính sách xác thực đã thống nhất.
- Creator chỉ quản lý nội dung thuộc quyền mình; admin/moderator theo quyền được cấp.
- Ba khu vực UI không đồng nghĩa với ba role database.
- JWT là hướng xác thực chính, nhưng phải kiểm thử triển khai thực tế. Không mặc định refresh/logout đã hoàn thành.
- Mọi thao tác ghi/sửa/xóa cần kiểm tra input, quyền và trạng thái phía backend.

## 5. Quy trình task
1. Đọc file liên quan, nơi gọi, cấu hình, schema và contract.
2. Ghi phạm vi, file dự kiến sửa, phụ thuộc và tiêu chí hoàn thành.
3. Trao đổi trước nếu đổi API, schema, quyền hoặc nghiệp vụ.
4. Triển khai thay đổi nhỏ, không sửa phần ngoài phạm vi.
5. Chạy test phù hợp, ghi rõ phần chưa test.
6. Review `git diff`, chạy `git diff --check`, kiểm tra `git status`.
7. Cập nhật tài liệu liên quan nếu có thay đổi.
8. Stage/commit đúng phạm vi; không dùng `git add .` máy móc.

## 6. Các giai đoạn
- **A — Ổn định nền tảng:** xác minh cấu hình, SQL Server, Auth/JWT và User CRUD.
- **B — Chốt contract/dữ liệu:** thống nhất request/response/status/role; TV3 đối chiếu schema.
- **C — Triển khai theo lát cắt:** hoàn thành một luồng backend + frontend + test rồi mới mở rộng.
- **D — Tích hợp/nghiệm thu:** regression, build, sửa lỗi và cập nhật tài liệu.

Task chỉ DONE khi đạt tiêu chí, test phù hợp đã chạy, diff được review và tài liệu liên quan được cập nhật.
