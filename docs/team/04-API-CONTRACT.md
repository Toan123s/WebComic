# 04 — API Contract

## 1. Trạng thái endpoint
Các endpoint dưới đây là tham khảo/đề xuất, **không khẳng định đã triển khai hoặc đã chốt**. Kiểm tra controller hiện có trước khi thêm. Gắn trạng thái:
- `EXISTS`: có trong code, vẫn cần test.
- `AGREED`: contract đã chốt nhưng chưa triển khai.
- `PROPOSED`: cần review.
- `DEFERRED`: để giai đoạn sau.

## 2. Quy tắc chung
- Base path đề xuất `/api`.
- Chốt method, path, request, response, status code, authentication, role và ownership trước tích hợp.
- Lấy user hiện tại từ principal; không nhận user identity từ body khi không cần.
- Field/ID phải khớp DTO, Entity và SQL Server.
- Nếu code hiện có khác đề xuất, không tự phá tương thích; cập nhật contract sau khi thống nhất.

## 3. Auth
| Method | Endpoint | Mục đích/trạng thái |
|---|---|---|
| POST | `/api/auth/login` | Login — kiểm tra code hiện có |
| POST | `/api/auth/register` | Register — PROPOSED |
| POST | `/api/auth/refresh` | Refresh — cần chốt token policy |
| POST | `/api/auth/logout` | Logout/revoke — cần chốt token policy |

## 4. User
| Method | Endpoint | Mục đích/trạng thái |
|---|---|---|
| GET | `/api/users/me` | Profile hiện tại — xác minh contract |
| PUT/PATCH | `/api/users/me` | Cập nhật profile — chốt method/DTO |
| GET | `/api/users` | Danh sách user — role được phép |
| GET | `/api/users/{id}` | Xem user — chốt quyền/dữ liệu public |
| PATCH | `/api/users/{id}` | Cập nhật user — role/ownership |

Đối chiếu User CRUD đã có trước khi thêm endpoint mới.

## 5. Comic và Category
| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/comics` | Danh sách/tìm kiếm — PROPOSED |
| GET | `/api/comics/{id}` | Chi tiết — PROPOSED |
| POST | `/api/comics` | Tạo truyện — creator được phép |
| PATCH | `/api/comics/{id}` | Sửa — kiểm tra ownership |
| DELETE | `/api/comics/{id}` | Xóa/ẩn — cần chốt policy |
| PATCH | `/api/comics/{id}/publish` | Publish/unpublish — cần chốt trạng thái |
| GET | `/api/categories` | Danh sách |
| GET | `/api/categories/{id}` | Chi tiết |
| POST | `/api/categories` | Tạo — role được phép |
| PATCH | `/api/categories/{id}` | Sửa — role được phép |
| DELETE | `/api/categories/{id}` | Xóa — chốt xử lý category đang dùng |

## 6. Chapter và pages
| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/comics/{comicId}/chapters` | Danh sách chapter |
| GET | `/api/chapters/{chapterId}` | Chi tiết chapter |
| POST | `/api/comics/{comicId}/chapters` | Tạo chapter — creator sở hữu comic |
| PATCH | `/api/chapters/{chapterId}` | Sửa — kiểm tra ownership |
| DELETE | `/api/chapters/{chapterId}` | Xóa/ẩn — chốt policy |
| GET | `/api/chapters/{chapterId}/pages` | Danh sách trang |
| POST | `/api/chapters/{chapterId}/pages` | Thêm trang — chốt upload/metadata |
| PATCH | `/api/chapters/{chapterId}/pages/{pageId}` | Sửa metadata/thứ tự |
| DELETE | `/api/chapters/{chapterId}/pages/{pageId}` | Xóa trang — chốt policy |

## 7. Comment, bookmark, follow, history, rating
| Method | Endpoint | Mục đích |
|---|---|---|
| GET/POST | `/api/comics/{comicId}/comments` | Xem/tạo comment |
| PATCH/DELETE | `/api/comments/{commentId}` | Sửa/xóa — owner/moderation |
| GET/POST | `/api/bookmarks` | Danh sách/thêm bookmark |
| DELETE | `/api/bookmarks/{id}` | Bỏ bookmark |
| GET/POST | `/api/follows` | Danh sách/follow |
| DELETE | `/api/follows/{id}` | Unfollow |
| GET | `/api/reading-history` | History của user hiện tại |
| DELETE | `/api/reading-history/{id}` | Xóa mục history |
| PUT | `/api/comics/{comicId}/rating` | Tạo/cập nhật rating — chốt mô hình |
| GET | `/api/comics/{comicId}/rating` | Xem rating/tổng hợp |

Không cho client thao tác dữ liệu cá nhân của user khác.

## 8. Report/Admin
| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/api/reports` | Gửi report |
| GET | `/api/admin/reports` | Danh sách — chốt role |
| PATCH | `/api/admin/reports/{id}` | Xử lý — chốt trạng thái |
| GET | `/api/admin/dashboard` | Thống kê |
| GET | `/api/admin/moderation-logs` | Nhật ký moderation |
| GET | `/api/admin/users` | Quản lý user |
| PATCH | `/api/admin/users/{id}` | Cập nhật user theo quyền |
| GET/POST/PATCH/DELETE | `/api/admin/categories` | Quản lý category — chốt route |

## 9. Pagination và lỗi
Pagination đề xuất: `page`, `size`, `sort`; chốt page index (0 hay 1). Response phân trang có thể dùng `content`, `page`, `size`, `totalElements`, `totalPages` nếu khớp code.

Status tham khảo: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `500`. `401` là chưa xác thực; `403` là đã xác thực nhưng thiếu quyền. Lỗi không được lộ stack trace/secret.

Response lỗi đề xuất (có thể dùng `ProblemDetail` nếu dự án đã chọn):
```json
{
  "title": "Validation failed",
  "status": 400,
  "detail": "Request data is invalid"
}
```

Trước tích hợp, mỗi endpoint cần ghi request/response fields, validation, success/error status, quyền, chủ trì và test.

## 10. Quy trình phối hợp API trước và trong tích hợp
**Chủ trì:** TV1 định nghĩa/triển khai API; TV2 xác nhận nhu cầu UI và tiêu thụ API; TV3 review contract và chuẩn bị test.

Trước khi coi một endpoint là sẵn sàng tích hợp, ghi tối thiểu: method/path; query/path params; request JSON và validation; response JSON; mã HTTP thành công và lỗi; error body; authentication/role/ownership; chủ trì; trạng thái (PROPOSED/AGREED/IMPLEMENTED/VERIFIED). Endpoint ghi `PROPOSED` chưa phải hợp đồng đã chốt.

- TV1 và TV2 phải thống nhất các trường trên trước khi nối API thật. Không tự ý đổi field, endpoint hoặc status mà không báo bên còn lại.
- TV2 có thể phát triển UI bằng mock data trước. Mock phải nằm tách biệt, được ghi chú rõ; không dùng mock để kết luận API đã hoạt động. Khi endpoint thật có sẵn, thay bằng API service thật và kiểm tra kiểu dữ liệu/response.
- TV3 có thể tạo Postman request/test cases từ contract đã thống nhất trước khi endpoint hoàn thành. Khi endpoint có thật, chạy lại với backend thật, lưu expected/actual, mã HTTP, kết quả và lỗi tái hiện.
- Mọi thay đổi contract phải có lý do, người xác nhận và cập nhật tài liệu/test; các bên bị ảnh hưởng (ít nhất TV1 và TV2, TV3 khi test bị ảnh hưởng) cần đồng ý trước khi áp dụng.
