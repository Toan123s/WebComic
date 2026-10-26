# 07 — Task Board

## 1. Trạng thái
- `BACKLOG`: chưa bắt đầu.
- `IN_PROGRESS`: đang làm.
- `REVIEW`: chờ review/kiểm chứng.
- `BLOCKED`: bị chặn.
- `DONE`: đạt tiêu chí và có bằng chứng test/review.
- `DEFERRED`: thống nhất để sau.

Bảng là khung khởi đầu, không khẳng định tiến độ code hiện tại. `REVIEW` ở tài liệu nghĩa là cần nhóm xem xét bản biên tập trước khi áp dụng vào repo.

## 2. Tài liệu nhóm
| ID | Task | Chủ trì | Tiêu chí hoàn thành | Trạng thái khởi đầu |
|---|---|---|---|---|
| DOC-01 | Rà kế hoạch nhóm | Cả nhóm | Vai trò/nguyên tắc rõ | REVIEW |
| DOC-02 | Rà file ownership | Cả nhóm | Phân biệt phạm vi và file bắt buộc | REVIEW |
| DOC-03 | Chốt nghiệp vụ còn mở | Cả nhóm | Có phương án/người xác nhận | BACKLOG |
| DOC-04 | Chốt code/Git rules | Cả nhóm | Quy tắc áp dụng được | REVIEW |
| DOC-05 | Xác nhận API contract | TV1 + TV2; TV3 review | Endpoint có trạng thái rõ | REVIEW |
| DOC-06 | Rà test checklist | TV3 | Tiêu chí/test evidence rõ | REVIEW |
| DOC-07 | Xác nhận decisions log | Cả nhóm | Trạng thái quyết định đúng | REVIEW |
| DOC-08 | Đồng bộ task board | Cả nhóm | Status phản ánh tiến độ thật | REVIEW |
| DOC-09 | Rút gọn header templates | Cả nhóm | Header là tùy chọn | REVIEW |

## 3. Nền tảng backend/security
| ID | Task | Chủ trì | Tiêu chí hoàn thành | Trạng thái |
|---|---|---|---|---|
| BE-01 | Xác minh cấu hình và SQL Server | TV1 + TV3 | App chạy, schema validate | BACKLOG |
| BE-02 | Kiểm tra login/JWT | TV1 | Login/token/protected endpoint được test | BACKLOG |
| BE-03 | Kiểm tra User CRUD | TV1 | CRUD/validation/error được test | BACKLOG |
| BE-04 | Xác minh ownership/role | TV1 + TV3 | Test quyền đúng/sai | BACKLOG |

## 4. Database/QA
| ID | Task | Chủ trì | Tiêu chí hoàn thành | Trạng thái |
|---|---|---|---|---|
| DB-01 | Đối chiếu schema | TV3 | PK/FK/constraints được ghi nhận | BACKLOG |
| DB-02 | Chốt schema-change workflow | TV3 + TV1 | Quy trình được nhóm chấp thuận | BACKLOG |
| QA-01 | Duy trì Postman collection | TV3 | Request/expected response rõ | BACKLOG |
| QA-02 | Test Auth/Security | TV3 + TV1 | Có pass/fail và lỗi | BACKLOG |
| QA-03 | Test User CRUD | TV3 + TV1 | Trường hợp chính được test | BACKLOG |
| QA-04 | Test Comic/Chapter | TV3 + TV1 | Khi module được chọn triển khai | BACKLOG |
| QA-05 | Test frontend/backend integration | Cả nhóm | Luồng UI/API hoạt động | BACKLOG |

## 5. Thêm task
Ghi mục tiêu, phạm vi, chủ trì/reviewer, file bị ảnh hưởng, phụ thuộc API/schema/role, tiêu chí hoàn thành, test, blocker và commit liên quan.

## 6. Nhật ký
| Ngày | Task | Người thực hiện | Kết quả/bằng chứng |
|---|---|---|---|
| YYYY-MM-DD | TASK-ID | Thành viên | Commit, test hoặc việc còn lại |
