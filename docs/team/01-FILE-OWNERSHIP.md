# 01 — File Ownership & Boundaries

## 1. Quy tắc
Bảng mô tả phạm vi phụ trách, không phải danh sách bắt buộc tạo file. Trước khi tạo file mới, kiểm tra chức năng tương đương đã có chưa.

## 2. Phân công cấp thư mục
| Phạm vi | Chủ trì | Phối hợp |
|---|---|---|
| `backend/src/main/java/com/comichub/` | TV1 | TV3 schema/test; TV2 API contract |
| `frontend/src/` | TV2 | TV1 API/auth; TV3 integration |
| `database/` | TV3 | TV1 Entity/repository |
| API contract và tài liệu nhóm | Cả nhóm | Thành viên bị ảnh hưởng review |
| Postman, test cases, integration | TV3 | TV1, TV2 |

## 3. Backend
| Phần | Chủ trì | Ranh giới |
|---|---|---|
| `config/`, `security/` | TV1 | Runtime/security/JWT; không chứa secret |
| `controller/` | TV1 | HTTP mapping, validation, gọi Service, trả response |
| `service/` | TV1 | Nghiệp vụ, ownership, trạng thái, transaction |
| `repository/` | TV1 | Truy vấn persistence, không quyết định nghiệp vụ |
| `entity/` | TV1 + TV3 | Khớp SQL Server schema |
| `dto/` | TV1 + TV2 | Request/response khớp contract |
| `mapper/` | TV1 | Mapping, không query hoặc chứa nghiệp vụ |
| `exception/` | TV1 | Exception và HTTP error response thống nhất |
| Upload/file storage | TV1 + TV3 | Quyền, giới hạn file, metadata và lỗi filesystem |

Các tên như `ComicService`, `RefreshTokenService`, `AdminDashboardService` chỉ là ví dụ cho module có thể cần; chỉ tạo khi task được chọn và chưa có thành phần tương đương.

## 4. Frontend
| Phần | Chủ trì | Ranh giới |
|---|---|---|
| `App.tsx`, `main.tsx`, routes | TV2 | Khởi tạo và route |
| `layouts/` | TV2 | Reader, Creator Studio, Admin |
| `pages/` | TV2 | UI flow; gọi API qua service |
| `components/` | TV2 | Component theo domain hoặc dùng chung |
| `services/` | TV2 | API client/endpoint theo contract |
| `types/` | TV2 + TV1 | Type khớp DTO thực tế |
| `context/`, `hooks/` | TV2 | Chỉ tạo abstraction dùng chung khi cần |
| `assets/`, CSS | TV2 | Tài nguyên và style |

## 5. Database và QA
TV3 chủ trì schema, seed roles, PK/FK/UNIQUE/NOT NULL/index, test cases, Postman, dữ liệu test và ghi nhận lỗi. Thay đổi schema phải trao đổi với TV1; không sửa âm thầm schema dùng chung.

## 6. Thay đổi chéo
1. Nêu lý do và phạm vi file.
2. Trao đổi với người phụ trách.
3. Chốt contract/schema nếu bị ảnh hưởng.
4. Review cùng người phụ trách khi thay đổi ảnh hưởng hành vi.

Mỗi task ghi file hiện có sẽ sửa, file mới (nếu cần), chủ trì/reviewer, ảnh hưởng API/schema/role và test. Tài liệu này không chứng minh một file đã tồn tại hoặc đã triển khai.
