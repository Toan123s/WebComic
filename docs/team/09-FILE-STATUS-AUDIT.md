# ComicHub — Rà soát phân công và trạng thái file

**Phạm vi:** rà soát ZIP dự án do nhóm gửi ngày 2026-10-29. Báo cáo chỉ kết luận dựa trên nội dung file trong ZIP; không khẳng định build/test đã chạy.

## Kết luận nhanh

- Tổng số file dự án được đưa vào ma trận: **248** (đã loại `.git`, thư mục build/dependency, `.env` thật và ZIP lồng bên trong).
- **TV1:** backend và security; phối hợp TV3 ở entity/repository/schema, phối hợp TV2 ở DTO/API.
- **TV2:** frontend React/TypeScript.
- **TV3:** database, Postman/test và integration; phối hợp TV1 để đối chiếu schema.
- Trạng thái “đã có mã nguồn” chỉ có nghĩa là thấy nội dung code, **không có nghĩa chức năng đã đúng hoặc đã test**.

## Trạng thái theo kiểm kê

| Trạng thái đọc được | Số file |
|---|---:|
| CHƯA TRIỂN KHAI | 166 |
| ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH | 22 |
| CÓ TÀI NGUYÊN | 20 |
| CẤU HÌNH FRONTEND — CẦN XÁC MINH | 12 |
| CẤU HÌNH/TEST — CẦN XÁC MINH | 11 |
| TÀI LIỆU — CẦN NHÓM XÁC NHẬN | 9 |
| CÓ SCRIPT — CẦN ĐỐI CHIẾU | 4 |
| TÀI LIỆU/CẤU HÌNH — CẦN XÁC MINH | 3 |
| CÓ MÃ NGUỒN MẪU — CHƯA HOÀN THÀNH | 1 |

## Phát hiện quan trọng

1. **Backend có cả code thật và controller khung.** `AuthController.java` có endpoint `POST /api/auth/login`; `UserController.java` có endpoint CRUD. Nhiều controller khác chỉ có header/comment, chưa có endpoint.
2. **Frontend còn phần lớn là khung.** `App.tsx` có code nhưng vẫn là nội dung demo/starter, chưa phải luồng ComicHub hoàn chỉnh. Nhiều page/component/hook/service/type chỉ có comment trạng thái.
3. **Cấu hình chưa đồng nghĩa đã tích hợp.** Cần xác minh Spring Boot khởi động, kết nối SQL Server, JWT login, endpoint bảo vệ và frontend gọi API.
4. **Database và test:** có schema SQL và cấu hình Postman; cần chạy/đối chiếu thật với entity, API và expected response.
5. **Không đánh dấu `DONE` chỉ vì file có code.** Task chỉ hoàn thành khi có test/review evidence được ghi nhận.

## Việc ưu tiên đề xuất

### TV1 — Backend/Security
1. Chốt và kiểm thử `POST /api/auth/login` (đăng nhập username/email, mật khẩu sai, tài khoản không tồn tại, token hợp lệ).
2. Kiểm thử User CRUD và response lỗi/validation.
3. Kiểm tra `SecurityConfig`, JWT filter, CORS, role/ownership server-side.
4. Triển khai các controller đang là khung theo API contract đã thống nhất; không tự tạo endpoint ngoài contract.

### TV2 — Frontend
1. Thay nội dung demo `App.tsx` bằng route/layout ComicHub theo cấu trúc hiện có.
2. Triển khai từng luồng ưu tiên: login, trang chủ/chi tiết/đọc truyện; nối API qua service.
3. Bổ sung loading/error/empty/success và kiểm tra route/role.
4. Chạy typecheck/build sau từng nhóm thay đổi.

### TV3 — Database/Testing/Integration
1. Đối chiếu `Create_Tables.sql` với entity/repository và ghi nhận PK/FK/UNIQUE/NOT NULL.
2. Duy trì Postman request + expected status/body; test Auth/User trước, sau đó Comic/Chapter.
3. Ghi pass/fail, lỗi tái hiện và commit/test evidence; phối hợp TV1/TV2 kiểm thử luồng tích hợp.

## Quy tắc cập nhật trạng thái

- `CHƯA TRIỂN KHAI`: file chỉ là khung/comment, chưa có hành vi thực thi.
- `ĐÃ CÓ MÃ NGUỒN — CHƯA XÁC MINH`: có code nhưng chưa có đủ bằng chứng chạy/test.
- `CÓ SCRIPT — CẦN ĐỐI CHIẾU`: tồn tại script; cần chạy và đối chiếu với backend.
- `DONE`: chỉ dùng khi tiêu chí hoàn thành đã đạt và có bằng chứng kiểm thử/review.

Xem `10-FILE-STATUS-MATRIX.csv` để tra đường dẫn, người phụ trách, trạng thái và việc tiếp theo cho từng file.

**Giới hạn:** phân loại dựa trên cấu trúc/nội dung văn bản; một số DTO/record hoặc file cấu hình ngắn cần người phụ trách xác nhận. Báo cáo không thay thế build/test thực tế.
