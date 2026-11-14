# 06 — Ma trận Authorization/RBAC backend

## Phạm vi và cách đọc

Ma trận này ghi nhận route có mapping HTTP thực tế trong `backend/src/main/java/com/comichub/controller`; file controller/service dạng khung không được xem là endpoint đã tồn tại. Kiểm tra mã nguồn không đồng nghĩa endpoint đã được nghiệm thu. Bằng chứng chạy test được ghi riêng ở cuối tài liệu.

Role hợp lệ lấy từ `database/seed/Roles.sql`: `USER`, `AUTHOR`, `MODERATOR`, `ADMIN`. `GUEST` là anonymous, không phải role. Access token chỉ xác định username; `CustomUserDetailsService` nạp authorities từ `user_roles` và chỉ công nhận bốn role trên. Đăng ký công khai chỉ gán role `USER`; request không nhận role.

HTTP status: anonymous tới API riêng tư `401`; authenticated nhưng thiếu role/ownership `403`; tài nguyên không công khai hoặc cần ẩn danh tính trả `404` ở Service; vi phạm trạng thái/duplicate trả `409`; request sai `400`.

## Endpoint thực tế

| Method | Path | Truy cập / role | Ownership / trạng thái | Bằng chứng |
|---|---|---|---|---|
| POST | `/api/auth/login` | Public | Credentials phải hợp lệ; account phải ACTIVE | `AuthServiceTest`, `JwtAuthenticationFilterTest` |
| POST | `/api/auth/refresh` | Public | Refresh token hợp lệ, còn hạn và chưa bị rotate | `RefreshTokenServiceTest`, `AuthServiceTest` |
| POST | `/api/auth/logout` | Authenticated | Chỉ thu hồi refresh token thuộc user hiện tại | `AuthServiceTest`; chưa có MVC role test |
| POST | `/api/users` | Public registration | Luôn tạo `USER`; role phải có trong DB; client không thể chọn role | `UserServiceTest` |
| GET | `/api/users` | `ADMIN` | Danh sách tài khoản chỉ dành cho admin | `SecurityAuthorizationIntegrationTest`, `UserServiceTest` |
| GET | `/api/users/{id}` | Authenticated; user chính chủ hoặc `ADMIN` | Người khác bị `403` | `UserServiceTest`; chưa có MVC owner test |
| PUT | `/api/users/{id}` | Authenticated; user chính chủ hoặc `ADMIN` | DTO chỉ cập nhật username/email/profile, không có role/status/password | Service kiểm tra ownership; chưa có MVC owner test |
| DELETE | `/api/users/{id}` | `ADMIN` | Chỉ admin xóa tài khoản | `SecurityAuthorizationIntegrationTest` kiểm tra role list; chưa có delete MVC test |
| GET | `/api/comics` | Public | Chỉ comic `PUBLISHED`, chưa xóa | SQL Server `BackendApplicationTests` |
| GET | `/api/comics/search` | Public | Chỉ comic `PUBLISHED`; bộ lọc và phân trang được validate | `ComicServiceTest`, SQL Server `BackendApplicationTests` |
| GET | `/api/comics/{id}` | Public nếu đã xuất bản; nếu không thì owner/`MODERATOR`/`ADMIN` | Comic private không tiết lộ cho người khác (`404`) | Service rule; chưa có MVC status test |
| GET | `/api/comics/mine` | `AUTHOR` | Chỉ comic của user hiện tại | Controller + service guard; chưa có MVC test |
| GET | `/api/comics/{id}/revisions` | Authenticated; owner/`MODERATOR`/`ADMIN` | Người khác bị `403`; comic đã xóa không truy cập | Service rule; chưa có MVC status test |
| POST | `/api/comics` | `AUTHOR` | Author lấy từ SecurityContext; tạo `DRAFT` | `ComicServiceTest`, `SecurityAuthorizationIntegrationTest` |
| PATCH | `/api/comics/{id}` | `AUTHOR` sở hữu comic | Draft/rejected sửa trực tiếp; published tạo revision pending; pending không sửa | `ComicServiceTest` |
| POST | `/api/comics/{id}/submit` | `AUTHOR` sở hữu comic | Chỉ `DRAFT`/`REJECTED` chuyển `PENDING` | `SecurityAuthorizationIntegrationTest` (SQL Server, owner/non-owner) |
| PATCH | `/api/comics/{id}/publish` | `ADMIN` | Chỉ `APPROVED` chuyển `PUBLISHED`; AUTHOR/MODERATOR không publish | `ComicServiceTest`, `SecurityAuthorizationIntegrationTest` |
| DELETE | `/api/comics/{id}` | Owner `AUTHOR` hoặc `ADMIN` | Xóa mềm; non-owner bị `403` | Service guard; chưa có MVC owner test |
| GET | `/api/categories`, `/api/categories/{id}` | Public | Chỉ trả category tồn tại | SQL Server `BackendApplicationTests` |
| POST/PATCH/DELETE | `/api/categories[/{id}]` | `ADMIN` | Category đang gắn với comic không xóa được | `CategoryServiceTest`; chưa có MVC role test |
| GET | `/api/comics/{comicId}/categories` | Public nếu comic public; nếu không owner/`MODERATOR`/`ADMIN` | Comic private không lộ cho người khác | Service guard; chưa có MVC status test |
| PUT | `/api/comics/{comicId}/categories` | Owner `AUTHOR` | Chỉ comic `DRAFT`/`REJECTED`; IDs category phải hợp lệ và không trùng | `CategoryServiceTest` |
| GET | `/api/comics/{comicId}/chapters` | Public; owner/`MODERATOR`/`ADMIN` xem trạng thái quản lý | Public chỉ thấy chapter đã xuất bản của comic đã xuất bản | `ChapterServiceTest`; chưa có MVC status test |
| GET | `/api/chapters/{id}` | Public hoặc owner/`MODERATOR`/`ADMIN` | Chapter chưa public trả `404` cho người không có quyền | Service guard; chưa có MVC status test |
| POST | `/api/comics/{comicId}/chapters` | Owner `AUTHOR` | Comic chưa xóa; chapter mới `DRAFT` | `ChapterServiceTest` |
| PATCH | `/api/chapters/{id}` | Owner `AUTHOR` | Chỉ `DRAFT`/`REJECTED` | `SecurityAuthorizationIntegrationTest` (SQL Server, non-owner); `ChapterServiceTest` |
| POST | `/api/chapters/{id}/submit` | Owner `AUTHOR` | Comic đã xuất bản; chapter có trang; trạng thái cho phép | `ChapterServiceTest` |
| DELETE | `/api/chapters/{id}` | Owner `AUTHOR` hoặc `ADMIN` | Pending không xóa; published ẩn mềm | Service guard; chưa có role MVC test |
| GET | `/api/chapters/{chapterId}/pages` | Public hoặc owner/`MODERATOR`/`ADMIN` | Phụ thuộc khả năng truy cập chapter cha | `ChapterPageServiceTest` |
| POST | `/api/chapters/{chapterId}/pages` | Owner `AUTHOR` | Chapter `DRAFT`/`REJECTED`; chapter cha phải thuộc comic của owner | `ChapterPageServiceTest` |
| DELETE | `/api/chapter-pages/{pageId}` | Owner `AUTHOR` | Chỉ chapter `DRAFT`/`REJECTED`; không thao tác trang của owner khác | `ChapterPageServiceTest` |
| GET | `/api/chapter-pages/{pageId}/image` | Public hoặc owner/`MODERATOR`/`ADMIN` | Kiểm tra quyền qua chapter cha; đường dẫn file không lộ | `ChapterPageServiceTest` |
| GET | `/api/moderation/comics/pending` | `MODERATOR` hoặc `ADMIN` | Chỉ nội dung chờ kiểm duyệt | `ComicServiceTest`; chưa có MVC role test |
| POST | `/api/moderation/comics/{id}/approve` | `MODERATOR` hoặc `ADMIN` | Chỉ `PENDING` chuyển `APPROVED`; không tự kiểm duyệt comic của mình | `ComicServiceTest` |
| POST | `/api/moderation/comics/{id}/reject` | `MODERATOR` hoặc `ADMIN` | Chỉ `PENDING`; lý do bắt buộc; không tự kiểm duyệt | Service guard; chưa có test MVC |
| GET | `/api/moderation/comic-revisions/pending` | `MODERATOR` hoặc `ADMIN` | Chỉ revision pending của comic còn tồn tại | Service guard; chưa có MVC test |
| POST | `/api/moderation/comic-revisions/{revisionId}/approve` | `MODERATOR` hoặc `ADMIN` | Chỉ pending; tác giả không tự duyệt revision của mình | Service guard; chưa có MVC test |
| POST | `/api/moderation/comic-revisions/{revisionId}/reject` | `MODERATOR` hoặc `ADMIN` | Chỉ pending; lý do bắt buộc; tác giả không tự từ chối revision của mình | Service guard; chưa có MVC test |
| GET | `/api/moderation/chapters/pending` | `MODERATOR` hoặc `ADMIN` | Chỉ chapter pending thuộc comic public | Service guard; chưa có MVC test |
| POST | `/api/moderation/chapters/{chapterId}/approve` | `MODERATOR` hoặc `ADMIN` | Chỉ pending chuyển `APPROVED`; không tự kiểm duyệt chapter của mình | `ChapterServiceTest` |
| POST | `/api/moderation/chapters/{chapterId}/reject` | `MODERATOR` hoặc `ADMIN` | Chỉ pending; lý do bắt buộc; không tự kiểm duyệt | Service guard; chưa có MVC test |
| POST | `/api/chapters/{chapterId}/publish` | `ADMIN` | Chỉ chapter `APPROVED` của comic `PUBLISHED` chuyển `PUBLISHED` | `ChapterServiceTest`, `SecurityAuthorizationIntegrationTest` |
| POST | `/api/chapters/{chapterId}/revisions` | Owner `AUTHOR` | Chapter phải public; tạo snapshot DRAFT, không thay đổi bản public | `ChapterRevisionServiceTest` |
| GET | `/api/chapters/{chapterId}/revisions` | Owner `AUTHOR`, `MODERATOR`, `ADMIN` | Chỉ người có quyền quản lý xem lịch sử snapshot | `ChapterRevisionServiceTest` |
| PATCH | `/api/chapter-revisions/{revisionId}` | Owner `AUTHOR` | Chỉ revision DRAFT | `ChapterRevisionServiceTest` |
| POST | `/api/chapter-revisions/{revisionId}/pages` | Owner `AUTHOR` | Thêm ảnh vào revision DRAFT; file mới dọn nếu transaction rollback | `ChapterRevisionServiceTest` |
| DELETE | `/api/chapter-revision-pages/{pageId}` | Owner `AUTHOR` | Chỉ xóa trang snapshot DRAFT, đánh lại số trang | `ChapterRevisionServiceTest` |
| DELETE | `/api/chapter-revisions/{revisionId}` | Owner `AUTHOR` | Chỉ xóa revision DRAFT | `ChapterRevisionServiceTest` |
| POST | `/api/chapter-revisions/{revisionId}/submit` | Owner `AUTHOR` | Cần ít nhất một trang; revision chuyển PENDING | `ChapterRevisionServiceTest` |
| GET | `/api/moderation/chapter-revisions/pending` | `MODERATOR` hoặc `ADMIN` | Chỉ chapter revision PENDING của chapter/comic còn public | `ChapterRevisionServiceTest` |
| POST | `/api/moderation/chapter-revisions/{revisionId}/approve` | `MODERATOR` hoặc `ADMIN` | Không tự duyệt; áp snapshot trong transaction, giữ revision history | `ChapterRevisionServiceTest` |
| POST | `/api/moderation/chapter-revisions/{revisionId}/reject` | `MODERATOR` hoặc `ADMIN` | Bắt buộc note; bản public cũ được giữ | `ChapterRevisionServiceTest` |
| GET | `/api/admin/roles` | `ADMIN` | Chỉ trả role whitelist | `RoleServiceTest` |
| GET | `/api/admin/users/{userId}/roles` | `ADMIN` | Đọc role hiện tại theo user | `RoleServiceTest` |
| PUT | `/api/admin/users/{userId}/roles` | `ADMIN` | Thay toàn bộ role; chặn role lạ và gỡ ADMIN cuối cùng | `RoleServiceTest` |
| GET | `/api/admin/moderation-logs` | `ADMIN` | Phân trang, lọc theo comic/chapter/moderator/action | `ModerationLogServiceTest` |
| GET/POST | `/api/bookmarks` | Authenticated `USER` hoặc `AUTHOR` | Chỉ dữ liệu user hiện tại; thêm được comic public; duplicate trả `409` | `BookmarkServiceTest`, SQL Server `BackendApplicationTests` |
| DELETE | `/api/bookmarks/{id}` | Authenticated `USER` hoặc `AUTHOR` | Chỉ xóa bookmark user hiện tại | `BookmarkServiceTest` |
| GET | `/api/reading-history` | Authenticated `USER` hoặc `AUTHOR` | Chỉ tiến độ user hiện tại; không trả nội dung đã ẩn/unpublished | `ReadingHistoryServiceTest` |
| PUT | `/api/reading-history/progress` | Authenticated `USER` hoặc `AUTHOR` | Upsert tiến độ theo user/comic; chapter phải public và trang phải tồn tại | `ReadingHistoryServiceTest` |
| DELETE | `/api/reading-history/{id}` | Authenticated `USER` hoặc `AUTHOR` | Chỉ xóa lịch sử thuộc user hiện tại | `ReadingHistoryServiceTest` |
| GET | `/api/comics/{comicId}/comments` | Public; người viết/`MODERATOR`/`ADMIN` thấy thêm trạng thái riêng | Public chỉ thấy VISIBLE; người viết chỉ thấy comment của mình; moderator thấy hàng đợi theo trạng thái | `CommentServiceTest` |
| POST | `/api/comics/{comicId}/comments` | `USER` hoặc `AUTHOR` | Chỉ comment lên comic/chapter public; comment mới PENDING; reply phải trỏ comment VISIBLE cùng vị trí | `CommentServiceTest` |
| PATCH | `/api/comments/{commentId}` | `USER` hoặc `AUTHOR`, owner | Comment VISIBLE/REJECTED sửa xong quay lại PENDING; HIDDEN/DELETED không sửa được | `CommentServiceTest` |
| DELETE | `/api/comments/{commentId}` | `USER` hoặc `AUTHOR`, owner | Chuyển status sang DELETED, không xóa cứng | `CommentServiceTest` |
| GET | `/api/moderation/comments/pending` | `MODERATOR` hoặc `ADMIN` | Chỉ comment PENDING; service cũng kiểm tra role | `CommentServiceTest` |
| POST | `/api/moderation/comments/{commentId}/approve` | `MODERATOR` hoặc `ADMIN` | PENDING → VISIBLE; không tự duyệt comment của mình | `CommentServiceTest` |
| POST | `/api/moderation/comments/{commentId}/reject` | `MODERATOR` hoặc `ADMIN` | PENDING → REJECTED; lý do bắt buộc; không tự từ chối comment của mình | `CommentServiceTest` |
| POST | `/api/moderation/comments/{commentId}/hide` | `MODERATOR` hoặc `ADMIN` | VISIBLE → HIDDEN; lý do bắt buộc; không tự ẩn comment của mình | `CommentServiceTest` |
| POST | `/api/reports` | `USER` hoặc `AUTHOR` | Chỉ nhận report cho Comic/chapter/comment đang public; status ban đầu OPEN | `ReportServiceTest` |
| GET | `/api/admin/reports` | `MODERATOR` hoặc `ADMIN` | Lọc status/targetType, page index 0, size 1–100 | `ReportServiceTest` |
| PATCH | `/api/admin/reports/{reportId}` | `MODERATOR` hoặc `ADMIN` | OPEN → IN_PROGRESS → RESOLVED/REJECTED; cần resolutionNote khi kết luận; không tự xử lý report của mình | `ReportServiceTest` |
| GET | `/api/admin/dashboard` | `ADMIN` | Đếm các hàng đợi moderation Comic/chapter/revision/comment/report | `AdminDashboardServiceTest` |

`MODERATOR` không được mặc định có quyền `ADMIN`. `ADMIN` được phép thực hiện moderation nhưng không được tự kiểm duyệt nội dung của chính mình. Với các API xóa/đọc riêng tư, service giữ quy tắc ownership kể cả khi được gọi không qua Controller. Moderation logs hỗ trợ `APPROVE`, `REJECT`, `PUBLISH`; cần chạy migration `002_Allow_Moderation_Publish_Action.sql` trên database đã tạo trước đó.

## Chưa có endpoint HTTP — không tính là đã triển khai

Các controller/service tương ứng hiện là file khung, không có method mapping; không bổ sung route trong công việc RBAC này:

- Follow; rating đang có thay đổi cục bộ nhưng chưa xác minh.
- API profile `/me`, upload tổng quát và các route quản trị khác trong API contract cũ.

Đăng ký chỉ gán role `USER`; ADMIN dùng `/api/admin/users/{userId}/roles` để thay toàn bộ role, với các bảo vệ chống gỡ/xóa ADMIN cuối cùng đang hoạt động.

Report có trạng thái `OPEN → IN_PROGRESS → RESOLVED/REJECTED`; migration `005_report_moderation_workflow.sql` chuyển giá trị `DISMISSED` cũ sang `REJECTED`. Comment dùng trạng thái `PENDING`, `VISIBLE`, `REJECTED`, `HIDDEN`, `DELETED`.

## Bằng chứng kiểm thử

| Lệnh | Phạm vi | Kết quả |
|---|---|---|
| `.\mvnw.cmd -Dtest=BackendApplicationTests,SecurityAuthorizationIntegrationTest,UserServiceTest,CustomUserDetailsServiceTest,ComicServiceTest,ChapterServiceTest,BookmarkServiceTest,JwtAuthenticationFilterTest test` | Unit + Spring Security integration + SQL Server role/ownership | PASS — 48 tests, 0 failures/errors (lần chạy targeted trước các test bổ sung cuối) |
| `.\mvnw.cmd test` | Full suite sau cập nhật RBAC/workflow, Reading History, role/admin logs và chapter revision | Cập nhật sau khi chạy trên DB đã áp dụng migration `002` và `003` |

`SecurityAuthorizationIntegrationTest` dùng Spring Security filter chain thực tế với mock principal (không phát JWT); test ownership tạo dữ liệu tạm trong SQL Server trong transaction rollback. Không xem đây là JWT end-to-end. JWT được kiểm tra riêng bởi `JwtAuthenticationFilterTest`; `BackendApplicationTests` xác minh role mapping `user_roles` trên SQL Server. Test Mockito chỉ chứng minh logic service với repository mock, không được xem là DB integration.
