# 03 — Code & Git Rules

## 1. Trước khi code
1. Xác nhận repository/branch.
2. Đọc file, nơi gọi, cấu hình và test liên quan.
3. Kiểm tra schema/API contract.
4. Tìm thành phần tương đương trước khi tạo file mới.
5. Ghi phạm vi và tiêu chí hoàn thành.

## 2. Backend
- Controller xử lý HTTP, validation request và response; không chứa nghiệp vụ phức tạp.
- Service xử lý nghiệp vụ, ownership, trạng thái và transaction khi cần.
- Repository truy cập dữ liệu; không quyết định quyền/nghiệp vụ.
- Entity khớp schema; không tự thêm cột.
- DTO chỉ nhận/trả dữ liệu cần thiết; không lộ password hash/token.
- Mapper chỉ chuyển đổi dữ liệu.
- Exception handler trả lỗi nhất quán, không lộ stack trace/secret.
- Không tin ID/role từ client; kiểm tra quyền phía server.
- Tránh N+1 query, bean/class trùng và abstraction không cần thiết.

## 3. Frontend
- Dùng TypeScript types khớp DTO/contract; tránh `any` nếu không cần.
- Gọi backend qua API service/client dùng chung khi phù hợp.
- Không giả lập thành công khi API thất bại.
- Có loading/error/empty state phù hợp.
- Validation UI không thay thế backend; route guard không thay thế authorization.
- Không chứa secret hoặc dữ liệu cá nhân trong source.

## 4. Database
- SQL Server schema là căn cứ đối chiếu Entity.
- Trao đổi với TV3 trước khi đổi cột, kiểu dữ liệu, PK/FK, constraint hoặc index.
- Ghi nhận schema change theo quy trình nhóm thống nhất.
- Nếu dùng migration, không sửa migration đã áp dụng ở môi trường dùng chung; tạo migration mới.
- Giữ `ddl-auto=validate` trừ khi nhóm thống nhất khác.

## 5. Git
- Kiểm tra `git status` trước/sau khi làm.
- Dùng branch theo workflow nhóm đang áp dụng.
- Commit nhỏ, tập trung; Conventional Commits khi phù hợp: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
- Ví dụ: `docs(team): align collaboration rules`.
- Stage đúng file; không dùng `git add .` máy móc.
- Trước commit xem `git diff`, `git diff --staged`, chạy `git diff --check`.
- Không commit `.env`, token, mật khẩu, `target/`, `node_modules/`, file upload hoặc dữ liệu riêng tư.
- Không force-push/sửa lịch sử branch dùng chung nếu chưa được đồng ý.

## 6. Review và lỗi
Bàn giao ghi mục đích, file thay đổi, ảnh hưởng API/schema/role, test đã chạy/chưa chạy và việc còn tồn tại. Reviewer kiểm tra correctness, bug, security, contract, tính cần thiết và test.

Khi báo lỗi, cung cấp bước tái hiện, request, kết quả mong đợi/thực tế, log đã loại secret và commit liên quan. Không tắt security hoặc bỏ validation chỉ để request chạy được.
