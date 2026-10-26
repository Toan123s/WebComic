# 02 — Business Rules

## 1. Trạng thái
- **Đã thống nhất:** định hướng có thể triển khai.
- **Cần xác minh:** đối chiếu code/schema trước khi áp dụng.
- **Cần nhóm chốt:** không tự quyết định thay nhóm.

## 2. Tài khoản và xác thực
- JWT là hướng xác thực chính; phải test triển khai thực tế.
- Mật khẩu được hash bằng `PasswordEncoder`; không lưu/trả mật khẩu dạng rõ.
- Không trả password hash, token hoặc secret trong DTO.
- Login xử lý đúng tài khoản không tồn tại, password sai và trạng thái tài khoản nếu có.
- Request chưa xác thực và request thiếu quyền phải bị từ chối theo contract.
- **Cần chốt:** refresh token, nơi lưu, expiry, rotation/revoke, logout và lưu token phía client.
- Đăng ký/khôi phục mật khẩu chỉ coi là có khi API, policy và test đã tồn tại.

## 3. Role và quyền
- Quyền thực tế căn cứ bảng `roles`, `user_roles`, seed và security config.
- Reader, Creator Studio, Admin là khu vực UI, không xác định số role DB.
- Public đọc nội dung công khai; creator quản lý nội dung của mình; admin/moderator chỉ thao tác trong phạm vi được cấp.
- Không tin role/user ID do client gửi; lấy principal từ security context và kiểm tra ownership.
- User không tự nâng role qua profile API.

## 4. Comic và category
- Public chỉ xem comic được phép công khai.
- Creator chỉ quản lý comic của mình.
- Publish cần kiểm tra quyền và điều kiện nghiệp vụ.
- Category xử lý dữ liệu trùng theo schema/policy.
- **Cần chốt:** trạng thái comic, điều kiện publish, xóa cứng/ẩn và xử lý category đang được sử dụng.

## 5. Chapter và trang truyện
- Chapter thuộc comic hợp lệ; creator không quản lý chapter của comic người khác.
- Thứ tự chapter/trang phải hợp lệ và không trùng nếu schema/policy yêu cầu.
- Public chỉ đọc chapter/trang được công khai.
- Upload phải đồng bộ metadata và file; transaction DB không rollback filesystem tự động.
- **Cần chốt:** đánh số chapter, sửa nội dung đã publish, xóa trang và xử lý lỗi file/DB.

## 6. Comment, bookmark, follow, history, rating
- Comment phải hợp lệ và theo policy đăng nhập.
- User chỉ sửa/xóa comment của mình trừ quyền moderation.
- Bookmark/follow không tạo liên kết trùng ngoài ý muốn.
- History chỉ thuộc user hiện tại; không đọc/xóa history người khác.
- Rating theo phạm vi điểm đã chốt và policy một user/comic.
- **Cần chốt:** rating range, comment theo comic/chapter, điều kiện rating, xóa history và nội dung bị ẩn.

## 7. Report và moderation
- Report phải có đối tượng/lý do hợp lệ.
- Chỉ role được cấp mới xử lý report/moderation.
- Trạng thái phải theo luồng đã thống nhất; ghi moderation log khi nghiệp vụ/schema yêu cầu.
- **Cần chốt:** trạng thái report, quyền moderator/admin và hành động sau xử lý.

## 8. Validation, lỗi và transaction
- Validate request ở DTO và điều kiện nghiệp vụ ở Service.
- Database constraint vẫn cần cho toàn vẹn dữ liệu.
- Không giả vờ thành công khi có lỗi; không trả stack trace.
- Dùng transaction cho nhóm thao tác DB cần nguyên tử.
- Không áp dụng soft delete/locking đại trà nếu chưa có yêu cầu/schema phù hợp.

## 9. Upload và quy tắc còn mở
- Xác minh quyền; kiểm tra loại, kích thước, tên và đường dẫn file.
- Không cho truy cập tùy ý file ngoài thư mục quản lý.
- Không commit `.env`, credentials, token thật hoặc file riêng tư.
- Ghi vấn đề còn mở vào `06-DECISIONS-LOG.md`, chốt phương án rồi cập nhật tài liệu/test.
