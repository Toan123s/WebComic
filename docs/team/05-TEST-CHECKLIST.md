# 05 — Test Checklist

## 1. Cách dùng
Chỉ đánh dấu `[x]` sau khi chạy test. Chức năng chưa triển khai ghi `N/A — chưa triển khai`, không đánh dấu pass. TV3 điều phối; TV1/TV2 sửa lỗi theo phạm vi.

## 2. Môi trường
- [x] Backend khởi động.
- [x] SQL Server kết nối.
- [x] Schema khớp Entity với `ddl-auto=validate`.
- [ ] Frontend khởi động/build.
- [ ] CORS đúng môi trường.
- [ ] Không có secret trong repository.
- [x] Dữ liệu test dùng transaction rollback/UUID/temp directory; có thể tái chạy mà không giữ dữ liệu kiểm thử.

## 3. Authentication/Security
- [x] Login hợp lệ.
- [ ] Password sai và user không tồn tại bị từ chối.
- [x] Login trả access token và refresh token; refresh token chỉ lưu dạng digest.
- [x] Access token sai chữ ký, sai issuer/type hoặc hết hạn bị từ chối.
- [x] Refresh token hợp lệ rotate đúng một lần; token cũ dùng lại thu hồi các phiên refresh còn hoạt động.
- [ ] Refresh token hết hạn/không tồn tại bị từ chối; tài khoản không ACTIVE không refresh được.
- [x] Logout chỉ thu hồi refresh token thuộc user hiện tại; logout không thu hồi refresh session của user khác.
- [x] Trạng thái account bị vô hiệu hóa được xử lý.
- [x] Protected endpoint không token bị từ chối (401).
- [x] Token sai/hết hạn bị từ chối.
- [x] User thiếu quyền bị từ chối (403).
- [x] Endpoint public vẫn truy cập được.
- [x] User/profile/registration response không lộ password hash hoặc trường quyền do client gửi.
- [x] Refresh/logout được kiểm tra bằng unit test.
- [x] Role authority chỉ lấy từ DB và whitelist đúng USER/AUTHOR/MODERATOR/ADMIN; không có role mặc định khi user chưa được gán.
- [x] Registration không nhận role và chỉ gán USER từ bảng roles.
- [x] Service/controller chặn user không phải ADMIN khỏi danh sách user.
- [x] Security filter chain trả 401 guest/invalid bearer, 403 authenticated sai role; public categories không cần token.
- [x] MODERATOR và ADMIN được phép dùng moderation queue; USER không có role moderation.
- [x] Owner không thể tự approve/reject comic/chapter/revision khi được cấp thêm role MODERATOR.
- [x] Workflow comic/chapter buộc `PENDING → APPROVED → PUBLISHED`; chỉ ADMIN publish, không thể bỏ qua approve.
- [x] Chỉ ADMIN được thay role; role không hợp lệ bị từ chối và không thể gỡ ADMIN cuối cùng đang hoạt động.
- [x] Không thể xóa tài khoản ADMIN cuối cùng đang hoạt động.
- [x] Chỉ ADMIN được xem moderation logs; bộ lọc action chỉ nhận APPROVE/REJECT/PUBLISH.
- [ ] Full endpoint/ownership matrix được chạy trên SQL Server cho từng role; xem [06-RBAC-MATRIX.md](./06-RBAC-MATRIX.md).

## 4. User
- [x] Tạo user hợp lệ; đăng ký chỉ gán role USER.
- [x] Username/email trùng được xử lý.
- [x] Thiếu field/email sai định dạng bị từ chối.
- [x] Xem/cập nhật profile `/api/users/me`; update validation và response không lộ password hash/token.
- [x] User không sửa dữ liệu người khác qua `/api/users/{id}`; profile `/me` chỉ lấy user từ principal.
- [x] User không tự nâng role qua registration/profile.
- [x] Admin API chặn user thiếu quyền.
- [x] DTO profile không nhận/trả password hash, token hoặc role; trường status/roles gửi thêm không làm thay đổi account.

## 5. Comic/Category
- [ ] Danh sách, search/filter/pagination trả đúng Comic public.
- [ ] Chi tiết tài nguyên tồn tại/không tồn tại.
- [ ] Public không xem comic chưa công khai.
- [ ] Creator chỉ tạo/sửa comic của mình.
- [x] Moderator chỉ duyệt comic `PENDING` sang `APPROVED`; Admin chỉ publish comic `APPROVED`.
- [ ] Sửa truyện đã public không làm thay đổi bản đang hiển thị trước khi duyệt revision.
- [ ] Chỉ một revision PENDING mỗi truyện; duyệt áp dụng snapshot, từ chối lưu lý do và giữ bản public cũ.
- [ ] Category trùng tên/slug được xử lý; chỉ ADMIN quản lý taxonomy.
- [ ] AUTHOR chỉ gắn category cho Comic của mình ở DRAFT/REJECTED.
- [ ] Category không thể xóa khi đang được gắn với Comic.
- [ ] User thiếu quyền không quản lý category hoặc Comic category mapping.

## 6. Chapter/pages/upload
- [x] AUTHOR chỉ tạo chapter cho comic của mình; sửa chapter của người khác bị từ chối.
- [x] Số chapter không trùng; chapter mới ở DRAFT.
- [x] Không gửi duyệt chapter rỗng hoặc thuộc comic chưa PUBLISHED.
- [x] MODERATOR duyệt chapter `PENDING` thành `APPROVED` hoặc từ chối có lý do; ghi moderation log. ADMIN publish `APPROVED`.
- [x] Revision chapter chỉ cho sửa ở DRAFT; bản public cũ giữ nguyên khi chờ duyệt và chỉ thay sau khi moderator duyệt snapshot.
- [ ] Public chỉ xem chapter PUBLISHED của comic PUBLISHED; owner/moderator xem đúng phạm vi.
- [x] Upload nhiều ảnh gán `page_number` liên tiếp theo thứ tự request.
- [ ] PNG hợp lệ được lưu dưới tên do server tạo; file không phải ảnh/quá giới hạn bị từ chối. Còn thiếu test ảnh JPEG/WebP hợp lệ.
- [ ] API image không lộ file của chapter nháp cho người không có quyền.
- [ ] Xóa trang chỉ ở DRAFT/REJECTED và đánh lại thứ tự; file chỉ bị xóa sau khi DB commit.
- [x] Xóa DRAFT/REJECTED dọn file sau commit; xóa PUBLISHED chỉ ẩn mềm; PENDING không xóa được.
- [x] Lỗi batch upload hoặc lỗi ghi DB rollback không để lại file đã tải lên.

## 7. Comment/bookmark/follow/history/rating
- [ ] Comment chỉ tạo được cho comic/chapter public; comment/reply mới ở PENDING.
- [x] Public chỉ thấy VISIBLE; người viết xem được trạng thái của comment mình; MODERATOR/ADMIN xem được queue.
- [ ] Parent comment phải VISIBLE và cùng comic/chapter; không reply vào vị trí khác.
- [ ] User chỉ sửa/xóa comment của mình; sửa comment VISIBLE/REJECTED đưa lại về PENDING; comment HIDDEN/DELETED không sửa được.
- [ ] MODERATOR/ADMIN approve/reject comment PENDING; reject cần lý do; không tự kiểm duyệt comment của mình.
- [ ] MODERATOR/ADMIN chỉ hide comment VISIBLE và phải ghi lý do.
- [ ] Migration comment status chạy được trên database cũ và schema mới.
- [x] Thêm/bỏ bookmark; chỉ bookmark truyện PUBLISHED, không tạo bản ghi trùng và không thao tác bookmark của user khác.
- [x] Follow Comic/creator có ownership và validation đúng; phân trang/lọc, duplicate, preference bật/tắt và bỏ follow hoạt động.
- [x] Publish chapter tạo một notification khi follow cả Comic lẫn creator; unread count, đọc một notification và đọc tất cả hoạt động.
- [x] History chỉ thuộc user hiện tại; không đọc/xóa history người khác.
- [x] USER/AUTHOR lưu được tiến độ của chapter public; chapter ẩn hoặc số trang không tồn tại bị từ chối.
- [x] Tiến độ được upsert theo comic, không tạo nhiều hàng cho cùng user/comic.
- [x] Rating chỉ nhận điểm 1–5; review đúng 300 ký tự được nhận, 301 bị từ chối.
- [x] PUT cập nhật rating hiện có thay vì tạo bản ghi trùng; điểm trung bình và số lượt được tính đúng.

## 8. Report/Admin
- [ ] Chỉ USER/AUTHOR gửi report cho Comic/chapter/comment public; target type/reason sai hoặc target ẩn bị từ chối.
- [x] MODERATOR/ADMIN xem report theo bộ lọc và phân trang; role khác bị từ chối.
- [x] Report chỉ chuyển OPEN → IN_PROGRESS → RESOLVED/REJECTED; không kết luận trực tiếp từ OPEN hoặc sửa trạng thái terminal.
- [x] RESOLVED/REJECTED bắt buộc có resolutionNote; người gửi không tự xử lý report.
- [ ] Report lưu handler/thời điểm/kết luận; migration chuyển DISMISSED cũ sang REJECTED và cập nhật status constraint.
- [x] Dashboard chỉ cho ADMIN.
- [x] Dashboard response ánh xạ đúng count của từng queue (unit test với giá trị repository giả lập; chưa kiểm tra aggregate trên dữ liệu SQL Server thật).
- [x] User không truy cập API quản trị hoặc tự nâng role.

## 9. Frontend/integration/regression
- [ ] Form/login có loading và error.
- [ ] Validation hiển thị rõ.
- [ ] Public/protected routes hoạt động đúng.
- [ ] API error hiển thị thân thiện; danh sách có empty state.
- [ ] Pagination hoạt động nếu có.
- [ ] Reader/Creator/Admin layout phù hợp và responsive.
- [ ] Frontend types khớp response thật.
- [ ] User CRUD và Auth hiện có không bị phá.
- [x] Backend tests pass; frontend build chưa chạy vì phạm vi hiện tại chỉ backend.
- [x] `git diff --check` pass; không stage/commit trong lượt này.

## 10. Mẫu ghi lỗi
- ID/tiêu đề:
- Commit/môi trường:
- Người phụ trách:
- Bước tái hiện:
- Request:
- Mong đợi / thực tế:
- Log đã loại secret:
- Trạng thái: Open / In Progress / Fixed / Verified

## 11. Test song song từ API contract
- [ ] TV3 đã tạo test case từ API contract được thống nhất, bao gồm request, expected status/body, auth/role và trường hợp lỗi.
- [ ] Nếu API chưa triển khai, test được ghi `BLOCKED — endpoint chưa có`, không đánh dấu pass.
- [ ] Khi endpoint thật sẵn sàng, TV3 chạy lại cùng test trên backend thật và ghi actual status/body, pass/fail, môi trường/commit.
- [ ] TV2 đã ghi rõ mock data ở đâu; mock không được dùng làm bằng chứng API thật thành công.
- [ ] Khi contract/schema/permission thay đổi đã được nhóm chấp thuận, test, frontend types và tài liệu liên quan đã được cập nhật.

Postman RBAC smoke collection: `backend/postman/ComicHub-RBAC.postman_collection.json`; environment `backend/postman/ComicHub-Local.postman_environment.json` chỉ chứa URL và token placeholder rỗng. Không commit token thật.

**Bằng chứng kiểm thử backend (SQL Server local):**
- `.\mvnw.cmd test` (chạy từ `backend`) — PASS, 143 tests trên 24 test suites, 0 failures, 0 errors, 0 skipped.
- `.\mvnw.cmd "-Dtest=SecurityAuthorizationIntegrationTest,UserServiceTest,ChapterServiceTest,ChapterPageServiceTest,ChapterRevisionServiceTest,FileStorageServiceTest" test` — PASS, 57 tests: xác minh profile/registration trên SQL Server, ownership, validation, upload batch rollback và DB flush rollback, cùng quy tắc xóa file sau commit.
- `.\mvnw.cmd "-Dtest=SecurityAuthorizationIntegrationTest,UserServiceTest,ChapterPageServiceTest,ChapterRevisionServiceTest,FileStorageServiceTest" test` (chạy từ `backend`) — ghi kết quả sau lượt xác minh hiện tại.
- `.\mvnw.cmd "-Dtest=FollowRatingNotificationIntegrationTest,RatingServiceTest,ChapterServiceTest,UserServiceTest" test` (chạy từ `backend`) — PASS, 25 tests: follow Comic/creator, notification publish/dedupe/read, rating boundary 300 ký tự, chapter publish và xóa creator.
- Đã áp dụng migration 006 trên SQL Server local; kiểm tra `follows` nullable target columns/filtered unique indexes và bảng `notifications`. Database trước migration có 0 follow, 0 rating. Schema local xác nhận `ratings.review NVARCHAR(300)`.
- `.\mvnw.cmd "-Dtest=ModerationApiIntegrationTest,SecurityAuthorizationIntegrationTest" test` (chạy từ `backend`) — PASS, 17 tests: xác minh HTTP MVC, quyền, comment PENDING→VISIBLE, report workflow và dashboard.
- Đã chạy lại migration comment 004 và report 005 trên SQL Server local; cả hai chạy thành công. Constraint comment cho phép PENDING/VISIBLE/REJECTED/HIDDEN/DELETED, default PENDING; constraint report cho phép OPEN/IN_PROGRESS/RESOLVED/REJECTED. Database không có report DISMISSED hoặc bản ghi report nào cần chuyển đổi.
- `.\mvnw.cmd "-Dtest=BackendApplicationTests,SecurityAuthorizationIntegrationTest" test` — PASS, 18 tests (3 application/JPA context, 15 authorization integration).
- Bộ unit test mục tiêu moderation và Comic/chapter/revision/log — PASS, 40 tests.
- Các mục chưa đánh dấu vẫn cần được kiểm thử riêng trước khi nghiệm thu toàn bộ moderation.

**Mẫu bằng chứng:** Endpoint/ID test; contract version hoặc commit; request (đã loại secret); expected; actual; PASS/FAIL/BLOCKED; môi trường; người chạy; lỗi liên quan.
