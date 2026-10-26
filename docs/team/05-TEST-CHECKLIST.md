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
- [ ] Trạng thái account bị vô hiệu hóa được xử lý nếu có.
- [ ] Protected endpoint không token bị từ chối (thường 401).
- [ ] Token sai/hết hạn bị từ chối.
- [ ] User thiếu quyền bị từ chối (thường 403).
- [ ] Endpoint public vẫn truy cập được.
- [ ] Response không chứa password hash/secret.
- [ ] Refresh/logout chỉ test nếu đã triển khai.

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
- [ ] Danh sách, search/filter/pagination theo contract.
- [ ] Chi tiết tài nguyên tồn tại/không tồn tại.
- [ ] Public không xem comic chưa công khai.
- [ ] Creator chỉ tạo/sửa comic của mình.
- [ ] Publish đúng điều kiện.
- [ ] Category trùng được xử lý.
- [ ] Xóa category đang được sử dụng theo policy.
- [ ] User thiếu quyền không quản lý category.

## 6. Chapter/pages/upload
- [ ] Chapter thuộc comic hợp lệ.
- [ ] Creator không quản lý chapter của người khác.
- [ ] Thứ tự chapter/trang hợp lệ.
- [ ] Public chỉ đọc nội dung được công khai.
- [ ] Upload đúng loại/trong giới hạn.
- [ ] File sai loại, quá lớn hoặc đường dẫn nguy hiểm bị từ chối.
- [ ] Lỗi file/DB không để lại dữ liệu sai.
- [ ] Xóa/thay file theo policy.

## 7. Comment/bookmark/follow/history/rating
- [ ] Comment hợp lệ; user chỉ sửa/xóa comment của mình.
- [ ] Comment ẩn không hiển thị sai.
- [ ] Thêm/bỏ bookmark; không tạo bản ghi trùng.
- [ ] Follow/unfollow đúng đối tượng; không tạo liên kết trùng.
- [ ] History chỉ thuộc user hiện tại; không đọc/xóa history người khác.
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
