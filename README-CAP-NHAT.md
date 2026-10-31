# ComicHub — Gói cập nhật phân công và trạng thái file

Gói này chỉ chứa các file được cập nhật ghi chú phân công/trạng thái, không phải toàn bộ project.

## Cách áp dụng
1. Giải nén gói này ở thư mục tạm.
2. Đối chiếu từng đường dẫn tương đối với repo `WebComic` hiện tại.
3. Chỉ chép đè các file trong phạm vi nhóm đã thống nhất; xem `docs/team/01-FILE-OWNERSHIP.md`.
4. Review `docs/team/07-TASK-BOARD.md` cùng nhóm. Không đánh dấu `DONE` nếu chưa có bằng chứng test/review.
5. Chạy build/test phù hợp rồi commit phần tài liệu/trạng thái riêng.

## Phạm vi trong gói
- Backend: controller, DTO, exception, mapper, repository, service và utility được ghi chú phân công/trạng thái.
- Frontend: các file React/TypeScript/CSS được ghi chú trạng thái.
- Database/config: schema, seed roles, application properties và `.env.example`.
- Tài liệu nhóm: kế hoạch, ownership, business rules, API contract, checklist test, decision log, task board và header templates.

## Lưu ý
- Ghi chú trong file mô tả trạng thái đọc được từ nội dung hiện có; nó không chứng minh chức năng chạy đúng.
- Trạng thái kiểm thử vẫn cần được cập nhật sau khi chạy test thực tế.
- Không chứa `.env` thật, không chứa thư mục `.git`, và không thay đổi logic nghiệp vụ trong gói này.
