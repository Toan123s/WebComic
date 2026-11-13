# 05 — Test Checklist

## 1. Cách dùng
Chỉ đánh dấu `[x]` sau khi chạy test. Chức năng chưa triển khai ghi `N/A — chưa triển khai`, không đánh dấu pass. TV3 điều phối; TV1/TV2 sửa lỗi theo phạm vi.

## 2. Môi trường
- [ ] Backend khởi động.
- [ ] SQL Server kết nối.
- [ ] Schema khớp Entity với `ddl-auto=validate`.
- [ ] Frontend khởi động/build.
- [ ] CORS đúng môi trường.
- [ ] Không có secret trong repository.
- [ ] Dữ liệu test tái tạo được; ghi commit/môi trường test.

## 3. Authentication/Security
- [ ] Login hợp lệ.
- [ ] Password sai và user không tồn tại bị từ chối.
- [ ] Login trả access token và refresh token; DB chỉ chứa digest refresh token.
- [ ] Access token sai chữ ký, sai issuer/type hoặc hết hạn bị từ chối.
- [ ] Refresh token hợp lệ rotate đúng một lần; token cũ dùng lại thu hồi các phiên refresh còn hoạt động.
- [ ] Refresh token hết hạn/không tồn tại bị từ chối; tài khoản không ACTIVE không refresh được.
- [ ] Logout chỉ thu hồi refresh token thuộc user hiện tại; logout không thu hồi refresh session của user khác.
- [ ] Trạng thái account bị vô hiệu hóa được xử lý nếu có.
- [ ] Protected endpoint không token bị từ chối (thường 401).
- [ ] Token sai/hết hạn bị từ chối.
- [ ] User thiếu quyền bị từ chối (thường 403).
- [ ] Endpoint public vẫn truy cập được.
- [ ] Response không chứa password hash/secret.
- [ ] Refresh/logout chỉ test nếu đã triển khai.
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
- [ ] Tạo user hợp lệ.
- [ ] Username/email trùng được xử lý.
- [ ] Thiếu field/email sai định dạng bị từ chối.
- [ ] Cập nhật profile hợp lệ.
- [ ] User không sửa dữ liệu người khác.
- [ ] User không tự nâng role.
- [ ] Admin API chặn user thiếu quyền.
- [ ] DTO không lộ dữ liệu nhạy cảm.

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
- [ ] AUTHOR chỉ tạo/sửa chapter thuộc comic của mình.
- [ ] Số chapter không trùng; chapter mới ở DRAFT.
- [ ] Không gửi duyệt chapter rỗng hoặc thuộc comic chưa PUBLISHED.
- [x] MODERATOR duyệt chapter `PENDING` thành `APPROVED` hoặc từ chối có lý do; ghi moderation log. ADMIN publish `APPROVED`.
- [x] Revision chapter chỉ cho sửa ở DRAFT; bản public cũ giữ nguyên khi chờ duyệt và chỉ thay sau khi moderator duyệt snapshot.
- [ ] Public chỉ xem chapter PUBLISHED của comic PUBLISHED; owner/moderator xem đúng phạm vi.
- [ ] Upload nhiều ảnh gán `page_number` liên tiếp theo thứ tự request.
- [ ] JPEG/PNG/WebP hợp lệ được lưu dưới tên do server tạo; file không phải ảnh/quá giới hạn bị từ chối.
- [ ] API image không lộ file của chapter nháp cho người không có quyền.
- [ ] Xóa trang chỉ ở DRAFT/REJECTED và đánh lại thứ tự; file chỉ bị xóa sau khi DB commit.
- [ ] Xóa DRAFT/REJECTED dọn metadata và file; xóa PUBLISHED chỉ ẩn mềm; PENDING không xóa được.
- [ ] Lỗi upload/DB rollback không để lại file mới hoặc metadata sai.

## 7. Comment/bookmark/follow/history/rating
- [ ] Comment hợp lệ; user chỉ sửa/xóa comment của mình.
- [ ] Comment ẩn không hiển thị sai.
- [x] Thêm/bỏ bookmark; chỉ bookmark truyện PUBLISHED, không tạo bản ghi trùng và không thao tác bookmark của user khác.
- [ ] Follow/unfollow đúng đối tượng; không tạo liên kết trùng.
- [x] History chỉ thuộc user hiện tại; không đọc/xóa history người khác.
- [x] USER/AUTHOR lưu được tiến độ của chapter public; chapter ẩn hoặc số trang không tồn tại bị từ chối.
- [x] Tiến độ được upsert theo comic, không tạo nhiều hàng cho cùng user/comic.
- [ ] Rating nằm trong phạm vi đã chốt.
- [ ] Cập nhật rating không tạo dữ liệu trùng trái policy.
- [ ] Tổng hợp rating đúng nếu đã triển khai.

## 8. Report/Admin
- [ ] Report hợp lệ; dữ liệu thiếu bị từ chối.
- [ ] User không tự xử lý report.
- [ ] Moderator/admin chỉ thực hiện quyền được cấp.
- [ ] Trạng thái report hợp lệ; log được ghi khi cần.
- [ ] Dashboard trả số liệu hợp lý nếu đã triển khai.
- [ ] User không truy cập API quản trị hoặc tự nâng role.

## 9. Frontend/integration/regression
- [ ] Form/login có loading và error.
- [ ] Validation hiển thị rõ.
- [ ] Public/protected routes hoạt động đúng.
- [ ] API error hiển thị thân thiện; danh sách có empty state.
- [ ] Pagination hoạt động nếu có.
- [ ] Reader/Creator/Admin layout phù hợp và responsive.
- [ ] Frontend types khớp response thật.
- [ ] User CRUD và Auth hiện có không bị phá.
- [ ] Backend tests pass; frontend build pass.
- [ ] `git diff --check` pass; không commit file/secret ngoài phạm vi.

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

**Mẫu bằng chứng:** Endpoint/ID test; contract version hoặc commit; request (đã loại secret); expected; actual; PASS/FAIL/BLOCKED; môi trường; người chạy; lỗi liên quan.
