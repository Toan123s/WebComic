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
- ADMIN quản lý category; tên/slug không được trùng.
- AUTHOR chỉ gắn category cho Comic của mình ở trạng thái `DRAFT` hoặc `REJECTED`; thay đổi không được phép sửa metadata Comic đã public ngoài luồng revision.
- Không xóa category đang được gắn với Comic; trước hết phải gỡ liên kết.
- Public có thể tìm kiếm Comic theo keyword, category và publication status; chỉ trả Comic `PUBLISHED`, có phân trang và giới hạn kích thước trang.
- Comic bị xóa mềm; slug của Comic giữ ổn định qua các lần sửa.

## 5. Chapter và trang truyện
- Chapter thuộc comic hợp lệ; AUTHOR chỉ quản lý chapter của comic mình sở hữu.
- Chapter có số dạng `DECIMAL(6,1)`, không trùng trong cùng comic và bắt đầu ở trạng thái `DRAFT`.
- AUTHOR upload một hoặc nhiều ảnh theo đúng thứ tự danh sách gửi lên; backend tự cấp `page_number` liên tiếp.
- Chỉ chapter `DRAFT` hoặc `REJECTED` được sửa metadata, thêm hoặc xóa trang.
- Chỉ được gửi duyệt khi comic đã `PUBLISHED` và chapter có ít nhất một trang. Comic/chapter chuyển `DRAFT/REJECTED → PENDING`; MODERATOR duyệt thành `APPROVED` hoặc từ chối thành `REJECTED` kèm lý do. Chỉ ADMIN được chuyển `APPROVED → PUBLISHED`; AUTHOR không được publish trực tiếp.
- Public chỉ đọc chapter có trạng thái `PUBLISHED` thuộc comic `PUBLISHED`; ảnh trang cũng kiểm tra quyền qua API, không expose đường dẫn file local trực tiếp.
- AUTHOR xóa cứng chapter `DRAFT/REJECTED` cùng metadata và file; chapter `PUBLISHED` được ẩn mềm và giữ file. Không cho xóa chapter `PENDING`.
- Chapter đã `PUBLISHED` không sửa trực tiếp. AUTHOR tạo revision DRAFT gồm snapshot metadata và danh sách trang, có thể sửa metadata/thêm/xóa trang trước khi gửi duyệt. Mỗi chapter chỉ có một revision DRAFT/PENDING tại một thời điểm.
- Khi revision đang chờ duyệt, bản chapter/trang hiện tại tiếp tục public. MODERATOR/ADMIN duyệt thì áp dụng snapshot trong cùng transaction; từ chối yêu cầu lý do và giữ nguyên bản public cũ. Tác giả không tự duyệt/từ chối revision của mình.
- Revision chapter và các trang snapshot có bảng riêng; `comic_revisions` chỉ lưu title/description/cover/publication status của Comic, không lưu dữ liệu chapter hay ảnh trang.
- Ảnh lưu trên ổ đĩa server trong `app.upload.dir`, tên file do server tạo; chấp nhận JPEG/PNG/WebP theo giới hạn upload cấu hình.
- Khi transaction DB upload thất bại, file mới phải được dọn; khi xóa metadata thành công, file liên quan được dọn sau commit.

## 6. Comment, bookmark, follow, history, rating
- Comment phải hợp lệ và theo policy đăng nhập.
- User chỉ sửa/xóa comment của mình trừ quyền moderation.
- Bookmark chỉ được tạo với truyện đã PUBLISHED; mỗi user chỉ bookmark một lần cho mỗi truyện và chỉ được xóa bookmark của mình.
- Follow hỗ trợ Comic đã PUBLISHED và creator ACTIVE có role AUTHOR; mỗi user chỉ follow một lần cho cùng một đối tượng và không được tự follow creator.
- Mỗi follow có tùy chọn bật/tắt notification, mặc định bật. Khi chapter được publish, follower Comic/creator nhận notification trong ứng dụng; follow cả hai nguồn chỉ tạo một notification, tác giả không tự nhận.
- Notification chỉ được user sở hữu xem, phân trang, đếm unread và đánh dấu đã đọc từng cái hoặc tất cả.
- Lịch sử đọc lưu tiến độ gần nhất cho mỗi cặp user/comic (không lưu từng lần đọc riêng). Chỉ `USER`/`AUTHOR` được ghi tiến độ cho trang tồn tại trong chapter và comic đã `PUBLISHED`; danh sách chỉ trả history của user hiện tại và nội dung vẫn còn public; chỉ chủ sở hữu được xóa.
- Rating dùng thang điểm 1–5, một rating cho mỗi user/Comic; PUT cập nhật rating hiện tại. Tác giả không tự đánh giá Comic của mình; review không bắt buộc và tối đa 300 ký tự.
- **Cần chốt:** comment theo comic/chapter, điều kiện rating theo trạng thái Comic, xóa history và nội dung bị ẩn.

## 6.1 Authorization/RBAC
- Chỉ dùng bốn role trong seed: `USER`, `AUTHOR`, `MODERATOR`, `ADMIN`; anonymous là GUEST, không có role DB.
- Authority được nạp từ `users -> user_roles -> roles` khi xác thực token; request không được tự khai role.
- Đăng ký công khai chỉ cấp role `USER`; chỉ luồng quản trị có ủy quyền được nâng/thu hồi role.
- `AUTHOR` thao tác nội dung của mình và không tự kiểm duyệt comic/chapter/revision của mình.
- `MODERATOR` và `ADMIN` được xử lý queue moderation; MODERATOR không mặc nhiên có quyền ADMIN.
- `ADMIN` được quản lý user/category và moderation; thao tác content vẫn phải qua kiểm tra trạng thái/ownership đã định nghĩa.
- Chỉ ADMIN được xem danh sách role, thay toàn bộ role của user, và xem moderation logs. Không cho gỡ role ADMIN cuối cùng đang hoạt động.
- 401: anonymous; 403: thiếu role/ownership; 404: tài nguyên riêng tư được ẩn theo policy; 409: trạng thái không hợp lệ.
- Ma trận route thực tế và endpoint còn thiếu được ghi tại [06-RBAC-MATRIX.md](./06-RBAC-MATRIX.md).

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
- Upload chapter hiện dùng local filesystem; chuyển object storage/cloud là công việc giai đoạn sau.
- Không commit `.env`, credentials, token thật hoặc file riêng tư.
- Ghi vấn đề còn mở vào `06-DECISIONS-LOG.md`, chốt phương án rồi cập nhật tài liệu/test.

## 10. Quy tắc thay đổi dùng chung
- API contract, schema SQL Server, seed role/permission và business rule đã được nhóm chốt là hợp đồng dùng chung. Không tự ý đổi endpoint, field/kiểu dữ liệu, mã trạng thái, quan hệ khóa, giá trị trạng thái nghiệp vụ hoặc quyền truy cập.
- Khi cần thay đổi, người đề xuất ghi lý do, lựa chọn thay thế, tác động đến backend/frontend/database/test và chờ các thành viên phụ trách phần bị ảnh hưởng xác nhận. Chỉ sau khi thống nhất mới sửa và cập nhật tài liệu/test.
- Trong lúc chờ API thật, frontend được dùng mock data để làm UI; mock không phải API đã hoàn thành và phải được thay/đối chiếu khi tích hợp.
- TV3 có thể chuẩn bị test từ contract đã chốt trước khi endpoint được triển khai; test chỉ được đánh dấu pass sau khi thực thi với đúng đối tượng kiểm thử và ghi bằng chứng.
