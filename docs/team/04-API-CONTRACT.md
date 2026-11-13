# 04 — API Contract

## 1. Trạng thái endpoint
Các endpoint dưới đây là tham khảo/đề xuất, **không khẳng định đã triển khai hoặc đã chốt**. Kiểm tra controller hiện có trước khi thêm. Gắn trạng thái:
- `EXISTS`: có trong code, vẫn cần test.
- `AGREED`: contract đã chốt nhưng chưa triển khai.
- `IMPLEMENTED`: đã có code; cần xác minh tích hợp và test với môi trường thật.
- `PROPOSED`: cần review.
- `DEFERRED`: để giai đoạn sau.

## 2. Quy tắc chung
- Base path đề xuất `/api`.
- Chốt method, path, request, response, status code, authentication, role và ownership trước tích hợp.
- Lấy user hiện tại từ principal; không nhận user identity từ body khi không cần.
- Field/ID phải khớp DTO, Entity và SQL Server.
- Nếu code hiện có khác đề xuất, không tự phá tương thích; cập nhật contract sau khi thống nhất.
- RBAC chỉ dùng role `USER`, `AUTHOR`, `MODERATOR`, `ADMIN` từ database; mọi route không được liệt kê public đều yêu cầu đăng nhập. Ma trận mapping route thực tế: [06-RBAC-MATRIX.md](./06-RBAC-MATRIX.md).

Frontend Reader gọi các API đã triển khai trong tài liệu này. Khi chạy Vite local, `/api` được proxy tới `http://localhost:8080`; khi frontend và backend khác origin, cấu hình `VITE_API_BASE_URL` cho frontend và `app.cors.allowed-origin-patterns` cho backend. CORS chỉ cho phép các origin được cấu hình và không bật credential cookies; access token gửi qua header `Authorization`.

## 3. Auth
| Method | Endpoint | Mục đích/trạng thái |
|---|---|---|
| POST | `/api/auth/login` | IMPLEMENTED — public; đăng nhập và cấp access + refresh token |
| POST | `/api/users` | IMPLEMENTED — public registration; server luôn gán role `USER`, không nhận role từ client |
| POST | `/api/auth/refresh` | IMPLEMENTED — public; nhận refresh token hiện tại, rotate và cấp cặp token mới |
| POST | `/api/auth/logout` | IMPLEMENTED — cần access token; thu hồi refresh token của đúng user/phiên hiện tại |

Login request gồm `usernameOrEmail` và `password`. Refresh/logout request gồm `refreshToken`. Login và refresh trả `accessToken`, `refreshToken`, `tokenType` (`Bearer`), `expiresIn` và `refreshExpiresIn` (milliseconds); login bổ sung `userId`, `username`, `displayName`.

Refresh token là chuỗi opaque ngẫu nhiên; DB chỉ lưu SHA-256 hex digest trong cột `refresh_tokens.token`. Chỉ dùng token một lần: refresh thành công thu hồi token cũ và trả token mới. Nếu token đã rotate bị dùng lại, backend thu hồi mọi refresh token còn hoạt động của tài khoản và trả `401`. Refresh token không tồn tại/hết hạn/tài khoản không ACTIVE cũng trả `401`. Logout trả `204` và chỉ thu hồi token nếu token thuộc user của access token gửi kèm; access token hiện tại vẫn hợp lệ tối đa tới `expiresIn`.

Schema hiện có đã đủ cột/unique constraint cho digest; không cần migration. `JWT_SECRET` phải là chuỗi Base64 giải mã thành tối thiểu 32 bytes ngẫu nhiên; đặt `JWT_EXPIRATION_MS` và `JWT_REFRESH_EXPIRATION_MS` theo milliseconds. Không bật TRACE security logging ở môi trường thường.

## 4. User
| Method | Endpoint | Mục đích/trạng thái |
|---|---|---|
| GET | `/api/users` | IMPLEMENTED — chỉ ADMIN |
| GET | `/api/users/{id}` | IMPLEMENTED — chính chủ hoặc ADMIN |
| PUT | `/api/users/{id}` | IMPLEMENTED — chính chủ hoặc ADMIN; DTO không có role/status/password |
| DELETE | `/api/users/{id}` | IMPLEMENTED — chỉ ADMIN |

Profile `/me`, role assignment, đổi trạng thái account và admin-specific user routes chưa có mapping HTTP; không xem User CRUD hiện có là API quản trị đầy đủ.

## 5. Comic và Category
| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/comics` | IMPLEMENTED — danh sách Comic public hiện tại |
| GET | `/api/comics/search` | IMPLEMENTED — tìm theo keyword/category/publicationStatus, phân trang |
| GET | `/api/comics/{id}` | IMPLEMENTED — public nếu PUBLISHED; tài nguyên riêng chỉ owner/MODERATOR/ADMIN |
| POST | `/api/comics` | IMPLEMENTED — AUTHOR; server gán owner và trạng thái DRAFT |
| PATCH | `/api/comics/{id}` | IMPLEMENTED — AUTHOR sở hữu comic; published tạo revision |
| GET | `/api/comics/{id}/revisions` | Lịch sử revision; giới hạn theo owner/MODERATOR/ADMIN |
| DELETE | `/api/comics/{id}` | IMPLEMENTED — AUTHOR sở hữu hoặc ADMIN; xóa mềm |
| POST | `/api/comics/{id}/submit` | IMPLEMENTED — owner AUTHOR chuyển DRAFT/REJECTED sang PENDING |
| PATCH | `/api/comics/{id}/publish` | IMPLEMENTED — chỉ ADMIN; chỉ chuyển APPROVED sang PUBLISHED |
| GET | `/api/moderation/comic-revisions/pending` | IMPLEMENTED — MODERATOR/ADMIN |
| POST | `/api/moderation/comic-revisions/{revisionId}/approve` | IMPLEMENTED — MODERATOR/ADMIN; không tự duyệt |
| POST | `/api/moderation/comic-revisions/{revisionId}/reject` | IMPLEMENTED — MODERATOR/ADMIN; yêu cầu lý do, không tự từ chối |
| GET | `/api/categories` | IMPLEMENTED — danh sách category public |
| GET | `/api/categories/{id}` | IMPLEMENTED — chi tiết category |
| POST | `/api/categories` | IMPLEMENTED — tạo category, ADMIN |
| PATCH | `/api/categories/{id}` | IMPLEMENTED — sửa category, ADMIN |
| DELETE | `/api/categories/{id}` | IMPLEMENTED — xóa nếu chưa gắn với Comic, ADMIN |
| GET | `/api/comics/{comicId}/categories` | IMPLEMENTED — category của Comic; private Comic chỉ owner/MODERATOR/ADMIN |
| PUT | `/api/comics/{comicId}/categories` | IMPLEMENTED — thay toàn bộ category IDs, AUTHOR sở hữu Comic ở DRAFT/REJECTED |

Tìm kiếm nhận `keyword` (tối đa 100 ký tự), `categoryId`, `publicationStatus` (`ONGOING`, `COMPLETED`, `HIATUS`), `page` (bắt đầu từ 0) và `size` (1–100, mặc định 20). Response gồm `content`, `page`, `size`, `totalElements`, `totalPages`. Xóa category đang được gắn trả `409`; category IDs lặp khi gắn vào Comic bị từ chối.

Revision của truyện đã công khai lưu trong bảng `comic_revisions`. Khi cập nhật database đã có, chạy lần lượt migration chưa áp dụng: `database/migration/001_Create_Comic_Revisions.sql`, `database/migration/002_Allow_Moderation_Publish_Action.sql`, `database/migration/003_Create_Chapter_Revisions.sql`. Không chạy lại `Create_Tables.sql` trên database có dữ liệu vì script đó xóa và tạo lại toàn bộ schema.

## 6. Chapter và pages
| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/comics/{comicId}/chapters` | IMPLEMENTED — public chỉ thấy chapter đã xuất bản; owner/MODERATOR/ADMIN xem được trạng thái quản lý |
| GET | `/api/chapters/{chapterId}` | IMPLEMENTED — chi tiết chapter, ẩn chapter chưa public khỏi người không có quyền |
| POST | `/api/comics/{comicId}/chapters` | IMPLEMENTED — AUTHOR sở hữu comic tạo chapter `DRAFT`; số chapter duy nhất trong comic |
| PATCH | `/api/chapters/{chapterId}` | IMPLEMENTED — chỉ AUTHOR sở hữu comic sửa chapter `DRAFT/REJECTED` |
| POST | `/api/chapters/{chapterId}/submit` | IMPLEMENTED — gửi duyệt khi comic `PUBLISHED` và chapter có ít nhất một trang |
| DELETE | `/api/chapters/{chapterId}` | IMPLEMENTED — DRAFT/REJECTED xóa hẳn metadata và file; PUBLISHED ẩn mềm; không xóa PENDING |
| POST | `/api/chapters/{chapterId}/revisions` | AUTHOR sở hữu chapter PUBLISHED tạo revision DRAFT từ snapshot metadata/trang hiện tại |
| GET | `/api/chapters/{chapterId}/revisions` | Owner/MODERATOR/ADMIN xem lịch sử revision và snapshot pages |
| PATCH | `/api/chapter-revisions/{revisionId}` | Owner AUTHOR cập nhật số/tên chapter khi revision còn DRAFT |
| POST | `/api/chapter-revisions/{revisionId}/pages` | Owner AUTHOR upload thêm ảnh vào revision DRAFT; multipart field `files` |
| DELETE | `/api/chapter-revision-pages/{pageId}` | Owner AUTHOR xóa trang khỏi revision DRAFT và đánh lại thứ tự |
| DELETE | `/api/chapter-revisions/{revisionId}` | Owner AUTHOR xóa revision DRAFT |
| POST | `/api/chapter-revisions/{revisionId}/submit` | Owner AUTHOR gửi revision có ít nhất một trang sang PENDING |
| GET | `/api/chapter-revision-pages/{pageId}/image` | Owner/MODERATOR/ADMIN xem ảnh thuộc snapshot revision |
| GET | `/api/chapters/{chapterId}/pages` | IMPLEMENTED — danh sách trang theo `page_number` |
| POST | `/api/chapters/{chapterId}/pages` | IMPLEMENTED — multipart field `files`, upload nhiều ảnh theo thứ tự gửi; page number tự nối tiếp |
| DELETE | `/api/chapter-pages/{pageId}` | IMPLEMENTED — xóa trang khỏi chapter DRAFT/REJECTED, đánh lại số trang liên tiếp |
| GET | `/api/chapter-pages/{pageId}/image` | IMPLEMENTED — phục vụ ảnh; kiểm tra chapter public hoặc quyền owner/MODERATOR/ADMIN |
| GET | `/api/moderation/chapters/pending` | IMPLEMENTED — danh sách chapter chờ duyệt, MODERATOR/ADMIN |
| POST | `/api/moderation/chapters/{chapterId}/approve` | IMPLEMENTED — duyệt chapter thành `APPROVED`, MODERATOR/ADMIN; không tự duyệt |
| POST | `/api/moderation/chapters/{chapterId}/reject` | IMPLEMENTED — từ chối chapter, bắt buộc có `note`, MODERATOR/ADMIN; không tự từ chối |
| POST | `/api/chapters/{chapterId}/publish` | IMPLEMENTED — chỉ ADMIN; chỉ chapter `APPROVED` của comic `PUBLISHED` được chuyển sang `PUBLISHED` |
| GET | `/api/moderation/chapter-revisions/pending` | MODERATOR/ADMIN xem chapter revisions đang chờ |
| POST | `/api/moderation/chapter-revisions/{revisionId}/approve` | MODERATOR/ADMIN áp dụng snapshot; bản public cũ được thay trong transaction sau khi duyệt |
| POST | `/api/moderation/chapter-revisions/{revisionId}/reject` | MODERATOR/ADMIN từ chối kèm note; giữ bản public cũ |

Upload chỉ nhận JPEG/PNG/WebP; giới hạn mỗi ảnh và tổng request theo cấu hình multipart hiện tại (10 MB/ảnh, 50 MB/request mặc định). File lưu ở `app.upload.dir` với tên ngẫu nhiên do server tạo; DB lưu đường dẫn tương đối, response dùng API image endpoint. Chapter đã `PUBLISHED` được sửa thông qua chapter revision snapshot riêng; bản cũ vẫn public cho tới khi revision được duyệt. Bảng moderation logs ghi `APPROVE`, `REJECT`, `PUBLISH`; database cũ cần áp dụng migration `002` để cho phép action `PUBLISH`.

## 7. Comment, bookmark, follow, history, rating
Các endpoint tương tác không được liệt kê là IMPLEMENTED bên dưới hiện chưa có controller mapping; các dòng NOT IMPLEMENTED là backlog contract, không phải route đang chạy.
| Method | Endpoint | Mục đích |
|---|---|---|
| GET/POST | `/api/comics/{comicId}/comments` | NOT IMPLEMENTED — controller/service còn khung |
| PATCH/DELETE | `/api/comments/{commentId}` | NOT IMPLEMENTED — controller/service còn khung |
| GET | `/api/bookmarks` | Danh sách bookmark của user hiện tại |
| POST | `/api/bookmarks` | Thêm bookmark (`{ "comicId": 123 }`) cho truyện đã PUBLISHED; trùng trả 409 |
| DELETE | `/api/bookmarks/{id}` | Bỏ bookmark của user hiện tại; thành công trả 204 |
| GET/POST | `/api/follows` | NOT IMPLEMENTED — controller/service còn khung |
| DELETE | `/api/follows/{id}` | NOT IMPLEMENTED — controller/service còn khung |
| GET | `/api/reading-history` | IMPLEMENTED — USER/AUTHOR xem tiến độ đọc của mình; chỉ hiện comic/chapter còn public |
| PUT | `/api/reading-history/progress` | IMPLEMENTED — USER/AUTHOR ghi/cập nhật tiến độ; chỉ chapter PUBLISHED của comic PUBLISHED và số trang tồn tại |
| DELETE | `/api/reading-history/{id}` | IMPLEMENTED — USER/AUTHOR chỉ xóa lịch sử của mình; thành công trả 204 |
| PUT | `/api/comics/{comicId}/rating` | NOT IMPLEMENTED — controller/service còn khung |
| GET | `/api/comics/{comicId}/rating` | NOT IMPLEMENTED — controller/service còn khung |

Không cho client thao tác dữ liệu cá nhân của user khác.

`PUT /api/reading-history/progress` nhận `{ "chapterId": 123, "lastPageNumber": 5 }`. Schema có một hàng cho mỗi cặp `(user_id, comic_id)`, do đó mỗi lần cập nhật sẽ thay thế tiến độ mới nhất của truyện đó. Response chứa thông tin comic/chapter, trang gần nhất, tổng số trang và thời điểm đọc. Guest và role khác USER/AUTHOR không được dùng các endpoint history.

## 8. Report/Admin
Các API quản trị dưới đây có trạng thái được ghi rõ; NOT IMPLEMENTED là backlog, không phải route đang chạy.
| Method | Endpoint | Mục đích |
|---|---|---|
| POST | `/api/reports` | NOT IMPLEMENTED — controller/service còn khung |
| GET | `/api/admin/reports` | NOT IMPLEMENTED — controller/service còn khung |
| PATCH | `/api/admin/reports/{id}` | NOT IMPLEMENTED — controller/service còn khung |
| GET | `/api/admin/dashboard` | NOT IMPLEMENTED — controller/service còn khung |
| GET | `/api/admin/roles` | ADMIN xem danh sách role được hỗ trợ |
| GET | `/api/admin/users/{userId}/roles` | ADMIN xem role của một user |
| PUT | `/api/admin/users/{userId}/roles` | ADMIN thay toàn bộ role; body `{ "roles": ["USER", "AUTHOR"] }`; không gỡ ADMIN cuối cùng đang hoạt động |
| GET | `/api/admin/moderation-logs` | ADMIN xem log phân trang; hỗ trợ lọc `comicId`, `chapterId`, `moderatorId`, `action` |
| GET | `/api/admin/users` | NOT IMPLEMENTED — User CRUD hiện ở `/api/users` |
| PATCH | `/api/admin/users/{id}` | NOT IMPLEMENTED |
| GET/POST/PATCH/DELETE | `/api/admin/categories` | NOT IMPLEMENTED — Category CRUD hiện ở `/api/categories`, ADMIN-only |

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
