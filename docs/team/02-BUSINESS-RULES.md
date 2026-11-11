# 02 — Business Rules

## 1. Trạng thái
- **Đã thống nhất:** định hướng có thể triển khai.
- **Cần xác minh:** đối chiếu code/schema trước khi áp dụng.
- **Cần nhóm chốt:** không tự quyết định thay nhóm.

## 2. Tài khoản và xác thực
- JWT là hướng xác thực chính; phải test triển khai thực tế.
- Mật khẩu được hash bằng `PasswordEncoder`; không lưu/trả mật khẩu dạng rõ.
- Không trả password hash hoặc secret trong DTO; access/refresh token chỉ trả từ endpoint xác thực.
- Login xử lý đúng tài khoản không tồn tại, password sai và trạng thái tài khoản nếu có.
- Request chưa xác thực và request thiếu quyền phải bị từ chối theo contract.
- Access token ký HMAC, thời hạn cấu hình mặc định 1 giờ; refresh token ngẫu nhiên opaque, mặc định 7 ngày, lưu SHA-256 hash trong DB.
- Mỗi lần refresh phải rotate refresh token; token cũ dùng lại sẽ thu hồi các refresh session còn hoạt động của tài khoản.
- Logout thu hồi refresh token của phiên hiện tại; access token đã phát hành vẫn hợp lệ đến khi hết hạn. Client phải xóa cả hai token khi logout.
- Refresh token được trao đổi qua JSON body. Không ghi token hoặc Authorization header vào log.
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
- Sửa truyện đã công khai lưu thành revision riêng để bản đang hiển thị không đổi trong lúc chờ MODERATOR; mỗi truyện chỉ có một revision `PENDING`.
- MODERATOR duyệt thì áp dụng revision; từ chối thì giữ nguyên truyện đang công khai và lưu lý do để AUTHOR xem lại.
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

## 10. Quy tắc thay đổi dùng chung
- API contract, schema SQL Server, seed role/permission và business rule đã được nhóm chốt là hợp đồng dùng chung. Không tự ý đổi endpoint, field/kiểu dữ liệu, mã trạng thái, quan hệ khóa, giá trị trạng thái nghiệp vụ hoặc quyền truy cập.
- Khi cần thay đổi, người đề xuất ghi lý do, lựa chọn thay thế, tác động đến backend/frontend/database/test và chờ các thành viên phụ trách phần bị ảnh hưởng xác nhận. Chỉ sau khi thống nhất mới sửa và cập nhật tài liệu/test.
- Trong lúc chờ API thật, frontend được dùng mock data để làm UI; mock không phải API đã hoàn thành và phải được thay/đối chiếu khi tích hợp.
- TV3 có thể chuẩn bị test từ contract đã chốt trước khi endpoint được triển khai; test chỉ được đánh dấu pass sau khi thực thi với đúng đối tượng kiểm thử và ghi bằng chứng.
