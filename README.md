# ComicHub - Kế hoạch dự án

## 1. Tổng quan

ComicHub là website đọc và quản lý truyện tranh, xây dựng với:

- Frontend: React + TypeScript
- Backend: Spring Boot + Spring MVC
- Database: Microsoft SQL Server
- ORM: JPA / Hibernate
- API: REST API
- Authentication / Authorization: RBAC
- AI: tích hợp ở giai đoạn sau

Mục tiêu chính là vừa xây dựng một web app hoàn chỉnh, vừa luyện quy trình phát triển phần mềm:

**Lập kế hoạch → Phân tích yêu cầu → Thiết kế → Lập trình → Kiểm thử → Triển khai → Bảo trì / cải tiến**

---

## 2. Kiến trúc tổng thể

```text
┌──────────────────────────────┐
│        React Frontend        │
│       React + TypeScript     │
└──────────────┬───────────────┘
               │ HTTP / JSON
               ↓
┌──────────────────────────────┐
│      Spring Boot Backend     │
│          Spring MVC          │
│                              │
│ Controller                   │
│      ↓                       │
│ Service                      │
│      ↓                       │
│ Repository                   │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│        SQL Server            │
└──────────────────────────────┘
```

Spring MVC được tổ chức theo hướng:

```text
React
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
SQL Server
```

Không sử dụng Microservices hoặc Clean Architecture ở giai đoạn đầu để tránh over-engineering.

---

# 3. Cấu trúc thư mục Root

```text
ComicHub/
├── frontend/                 # React + TypeScript
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── routes/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       └── ...
│
├── backend/                  # Spring Boot + Spring MVC
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/comichub/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── entity/
│   │   │   │   ├── dto/
│   │   │   │   ├── mapper/
│   │   │   │   ├── security/
│   │   │   │   ├── exception/
│   │   │   │   └── config/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── ...
│   │   └── test/
│   └── pom.xml
│
├── database/                 # SQL Server scripts
│   ├── schema/
│   ├── seed/
│   └── scripts/
│
├── docs/                     # Tài liệu dự án
│   ├── planning/
│   ├── requirements/
│   ├── design/
│   ├── api/
│   ├── database/
│   └── testing/
│
├── uploads/                  # Ảnh local khi phát triển
│   ├── comics/
│   └── chapters/
│
├── .gitignore
├── README.md
└── LICENSE
```

Không cần tạo toàn bộ thư mục con ngay từ đầu. Có thể tạo:

```text
frontend/
backend/
database/
docs/
README.md
.gitignore
```

trước, sau đó bổ sung thư mục khi bắt đầu từng phần.

---

# 4. Vai trò người dùng

ComicHub dự kiến có các nhóm quyền:

| Vai trò | Quyền chính |
|---|---|
| Guest | Xem, tìm kiếm, đọc truyện |
| USER | Comment, rating, bookmark, follow, history, report |
| AUTHOR | Tạo và quản lý truyện/chapter của mình |
| MODERATOR | Kiểm duyệt truyện và comment |
| ADMIN | Quản lý toàn hệ thống |

Guest không nhất thiết phải tồn tại trong database dưới dạng một user.

Guest chỉ là trạng thái người dùng chưa đăng nhập.

---

# 5. Quy trình đăng truyện

```text
AUTHOR
   ↓
DRAFT
   ↓
PENDING
   ↓
MODERATOR REVIEW
   ├── REJECTED
   │      ↓
   │   AUTHOR FIX
   │      ↓
   │   PENDING
   │
   └── APPROVED
          ↓
      PUBLISHED
```

Workflow này giúp project có business logic thực tế thay vì chỉ CRUD đơn giản.

---

# 6. Các chức năng chính

## Guest

- Xem trang chủ
- Xem danh sách truyện
- Tìm kiếm truyện
- Lọc theo thể loại
- Xem chi tiết truyện
- Xem danh sách chapter
- Đọc chapter

## USER

Bao gồm quyền Guest và:

- Đăng ký
- Đăng nhập
- Quản lý profile
- Comment
- Rating
- Bookmark
- Follow
- Reading history
- Report nội dung

## AUTHOR

Bao gồm quyền USER và:

- Author dashboard
- Tạo comic
- Chỉnh sửa comic
- Xóa comic
- Tạo chapter
- Upload chapter pages
- Submit comic để moderator duyệt
- Xem trạng thái moderation
- Sử dụng AI hỗ trợ sáng tạo

## MODERATOR

- Xem danh sách comic chờ duyệt
- Approve comic
- Reject comic
- Xem report
- Ẩn / xử lý comment vi phạm

## ADMIN

- Quản lý user
- Quản lý role
- Quản lý category
- Quản lý comic
- Quản lý chapter
- Quản lý hệ thống
- Xem thống kê cơ bản

---

# 7. Database dự kiến

## 7.1. Danh sách bảng

Các bảng cốt lõi:

```text
users
roles
user_roles

comics
categories
comic_categories

chapters
chapter_pages

comments
ratings
bookmarks
reading_history
```

Quan hệ chính:

```text
User 1 ───── N Comic
Comic 1 ──── N Chapter
Chapter 1 ── N ChapterPage

Comic N ───── N Category
       thông qua comic_categories

User 1 ───── N Comment
Comic 1 ───── N Comment

User 1 ───── N Rating
Comic 1 ───── N Rating

User 1 ───── N Bookmark
Comic 1 ───── N Bookmark

User 1 ───── N ReadingHistory
Comic 1 ───── N ReadingHistory
```

Có thể bổ sung sau:

```text
reports
notifications
ai_conversations
ai_messages
```

Quy ước chung cho phần thuộc tính bên dưới:

- Khóa chính: `BIGINT IDENTITY` (riêng `roles`, `categories` dùng `INT`)
- Thời gian: `DATETIME2`
- Chuỗi tiếng Việt: `NVARCHAR`

---

## 7.2. Thuộc tính các bảng cốt lõi

### users

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| username | NVARCHAR(50) | UNIQUE, NOT NULL |
| email | NVARCHAR(100) | UNIQUE, NOT NULL |
| password_hash | NVARCHAR(255) | Mã hóa BCrypt, không lưu mật khẩu thô |
| display_name | NVARCHAR(100) | Tên hiển thị / bút danh |
| avatar_url | NVARCHAR(500) | |
| bio | NVARCHAR(500) | Giới thiệu bản thân |
| status | VARCHAR(20) | ACTIVE / BANNED / INACTIVE |
| last_login_at | DATETIME2 | |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |

### roles

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | INT | PK |
| name | VARCHAR(30) | UNIQUE: USER, AUTHOR, MODERATOR, ADMIN |
| description | NVARCHAR(200) | |

### user_roles

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| user_id | BIGINT | FK → users, cùng PK ghép |
| role_id | INT | FK → roles, cùng PK ghép |
| assigned_at | DATETIME2 | |

### comics

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| author_id | BIGINT | FK → users |
| title | NVARCHAR(200) | NOT NULL |
| slug | VARCHAR(220) | UNIQUE, dùng cho URL đẹp |
| description | NVARCHAR(MAX) | Synopsis |
| cover_url | NVARCHAR(500) | |
| moderation_status | VARCHAR(20) | DRAFT / PENDING / APPROVED / REJECTED / PUBLISHED |
| publication_status | VARCHAR(20) | ONGOING / COMPLETED / HIATUS |
| reject_reason | NVARCHAR(500) | Lý do bị từ chối |
| reviewed_by | BIGINT | FK → users (moderator), NULL |
| reviewed_at | DATETIME2 | NULL |
| submitted_at | DATETIME2 | Lúc gửi duyệt |
| published_at | DATETIME2 | NULL |
| view_count | BIGINT | Mặc định 0 |
| rating_avg | DECIMAL(3,2) | Cache điểm trung bình |
| rating_count | INT | |
| is_deleted | BIT | Xóa mềm |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |

> `moderation_status` (workflow duyệt) và `publication_status` (đang ra / hoàn thành) là hai khái niệm khác nhau nên tách thành hai cột.

### categories

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | INT | PK |
| name | NVARCHAR(50) | UNIQUE |
| slug | VARCHAR(60) | UNIQUE |
| description | NVARCHAR(300) | |
| created_at | DATETIME2 | |

### comic_categories

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| comic_id | BIGINT | FK → comics, cùng PK ghép |
| category_id | INT | FK → categories, cùng PK ghép |

### chapters

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| comic_id | BIGINT | FK → comics |
| chapter_number | DECIMAL(6,1) | Cho phép chapter 10.5; UNIQUE cùng `comic_id` |
| title | NVARCHAR(200) | |
| status | VARCHAR(20) | DRAFT / PENDING / APPROVED / REJECTED / PUBLISHED |
| reject_reason | NVARCHAR(500) | |
| reviewed_by | BIGINT | FK → users, NULL |
| reviewed_at | DATETIME2 | NULL |
| page_count | INT | |
| view_count | BIGINT | |
| published_at | DATETIME2 | NULL |
| is_deleted | BIT | Xóa mềm |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |

### chapter_pages

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| chapter_id | BIGINT | FK → chapters |
| page_number | INT | UNIQUE cùng `chapter_id` |
| image_url | NVARCHAR(500) | Ví dụ `/uploads/comics/comic-001/chapter-001/page-001.jpg` |
| width | INT | Giúp reader dựng layout trước khi ảnh tải xong |
| height | INT | |
| file_size | BIGINT | Đơn vị byte |
| created_at | DATETIME2 | |

### comments

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK → users |
| comic_id | BIGINT | FK → comics |
| chapter_id | BIGINT | FK → chapters, NULL (bình luận ở chapter) |
| parent_id | BIGINT | FK → comments, NULL (trả lời bình luận) |
| content | NVARCHAR(1000) | |
| status | VARCHAR(20) | VISIBLE / HIDDEN / DELETED |
| hidden_by | BIGINT | FK → users (moderator), NULL |
| hidden_reason | NVARCHAR(300) | |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |

### ratings

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK → users |
| comic_id | BIGINT | FK → comics |
| score | TINYINT | CHECK 1–5 |
| review | NVARCHAR(500) | Tùy chọn |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |

Ràng buộc: `UNIQUE (user_id, comic_id)` - mỗi người chỉ đánh giá một truyện một lần.

### bookmarks

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK → users |
| comic_id | BIGINT | FK → comics |
| created_at | DATETIME2 | |

Ràng buộc: `UNIQUE (user_id, comic_id)`.

### reading_history

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK → users |
| comic_id | BIGINT | FK → comics |
| chapter_id | BIGINT | FK → chapters, chapter đọc gần nhất |
| last_page_number | INT | Để đọc tiếp đúng trang |
| read_at | DATETIME2 | Cập nhật mỗi lần đọc |

Ràng buộc: `UNIQUE (user_id, comic_id)` - mỗi truyện một dòng, ghi đè khi đọc tiếp.

---

## 7.3. Các bảng nên bổ sung

Các bảng dưới đây chưa có trong danh sách cốt lõi nhưng cần thiết cho các chức năng/API đã có trong kế hoạch.

### refresh_tokens

Cần cho `POST /api/auth/refresh`.

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK → users |
| token | VARCHAR(255) | UNIQUE |
| expires_at | DATETIME2 | |
| revoked | BIT | Mặc định 0 |
| created_at | DATETIME2 | |

### follows

Cần cho chức năng Follow (khác Bookmark).

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK → users |
| comic_id | BIGINT | FK → comics |
| notify_enabled | BIT | Bật/tắt thông báo chapter mới |
| created_at | DATETIME2 | |

Ràng buộc: `UNIQUE (user_id, comic_id)`.

### reports

Cần cho chức năng Report nội dung và màn hình Moderator xem report.

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| reporter_id | BIGINT | FK → users |
| target_type | VARCHAR(20) | COMIC / CHAPTER / COMMENT |
| target_id | BIGINT | ID của đối tượng bị report |
| reason | VARCHAR(30) | SPAM / INAPPROPRIATE / COPYRIGHT / OTHER |
| description | NVARCHAR(500) | |
| status | VARCHAR(20) | OPEN / RESOLVED / DISMISSED |
| handled_by | BIGINT | FK → users, NULL |
| handled_at | DATETIME2 | NULL |
| resolution_note | NVARCHAR(500) | |
| created_at | DATETIME2 | |

### moderation_logs (tùy chọn)

Lưu lịch sử duyệt. Nếu bỏ bảng này, chỉ xem được lần duyệt gần nhất trong `comics`.

| Thuộc tính | Kiểu | Ghi chú |
|---|---|---|
| id | BIGINT | PK |
| comic_id | BIGINT | FK → comics |
| chapter_id | BIGINT | FK → chapters, NULL |
| moderator_id | BIGINT | FK → users |
| action | VARCHAR(20) | APPROVE / REJECT |
| note | NVARCHAR(500) | |
| created_at | DATETIME2 | |

Vẫn có thể bổ sung sau: `notifications`, `ai_conversations`, `ai_messages`.

---

# 8. Cách tạo dữ liệu truyện tranh

## Không cần lấy truyện thương mại có bản quyền

Đây là project học tập nên không cần lấy hàng trăm bộ truyện thật.

Nên tách:

```text
Database
    ↓
Metadata
    ↓
File ảnh
```

SQL Server lưu metadata:

```text
Comic
├── id
├── title
├── description
├── author_id
├── status
└── ...

Chapter
├── id
├── comic_id
├── title
├── chapter_number
└── ...

ChapterPage
├── id
├── chapter_id
├── page_number
├── image_url
└── ...
```

Ảnh được lưu bên ngoài database.

Ví dụ:

```text
uploads/
└── comics/
    └── comic-001/
        ├── cover.jpg
        ├── chapter-001/
        │   ├── page-001.jpg
        │   ├── page-002.jpg
        │   └── page-003.jpg
        └── chapter-002/
            ├── page-001.jpg
            └── page-002.jpg
```

Database chỉ lưu:

```text
page_number = 1
image_url = /uploads/comics/comic-001/chapter-001/page-001.jpg
```

Không nên lưu toàn bộ file ảnh trực tiếp vào SQL Server cho project này.

---

# 9. Nguồn dữ liệu phù hợp

## Cách 1 - Tự tạo truyện giả

Đây là cách phù hợp nhất cho MVP.

Ví dụ:

```text
The Last Mage
Cyber City
Demon Hunter
Moonlight Academy
Dragon's Legacy
```

Có thể tự tạo:

- Tên truyện
- Mô tả
- Tác giả
- Thể loại
- Chapter
- Comment
- Rating
- User
- Status

## Cách 2 - Public Domain / Creative Commons

Có thể sử dụng nội dung có giấy phép cho phép sử dụng.

Cần kiểm tra license cụ thể trước khi đưa lên website.

## Cách 3 - Seed database

Có thể tạo dataset giả bằng SQL:

```text
10 comics
50 chapters
500 chapter pages
20 users
4 roles
100 comments
100 ratings
50 bookmarks
200 reading histories
```

Sau đó lưu trong:

```text
database/
├── schema/
│   └── create_tables.sql
│
└── seed/
    ├── roles.sql
    ├── users.sql
    ├── comics.sql
    ├── chapters.sql
    ├── comments.sql
    └── ...
```

Mục tiêu của dataset là phục vụ:

- CRUD
- Search
- Filter
- Pagination
- Authentication
- Authorization
- Moderation
- Rating
- Comment
- Bookmark
- Reading history
- Testing

Không cần có hàng nghìn truyện thật.

---

# 10. Backend structure

```text
backend/
└── src/
    └── main/
        └── java/
            └── com/comichub/
                ├── controller/
                ├── service/
                ├── repository/
                ├── entity/
                ├── dto/
                ├── mapper/
                ├── security/
                ├── exception/
                └── config/
```

Ý nghĩa:

```text
Controller
    ↓
Nhận HTTP request

Service
    ↓
Xử lý business logic

Repository
    ↓
Làm việc với database

Entity
    ↓
Đại diện dữ liệu database

DTO
    ↓
Dữ liệu request/response API
```

---

# 11. Frontend structure

```text
frontend/
└── src/
    ├── assets/
    ├── components/
    ├── pages/
    ├── layouts/
    ├── routes/
    ├── services/
    ├── hooks/
    ├── context/
    └── ...
```

Một số page:

```text
Home
ComicDetail
Reader
Search
Login
Register

Profile
Bookmark
History

AuthorDashboard
ComicManagement
ChapterManagement

ModeratorDashboard
ModerationDetail

AdminDashboard
UserManagement
CategoryManagement
```

---

# 12. API dự kiến

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

## Comic

```text
GET    /api/comics
GET    /api/comics/{id}
POST   /api/comics
PUT    /api/comics/{id}
DELETE /api/comics/{id}
```

## Category

```text
GET /api/categories
POST /api/categories
PUT /api/categories/{id}
DELETE /api/categories/{id}
```

## Chapter

```text
GET    /api/comics/{comicId}/chapters
GET    /api/chapters/{id}
POST   /api/comics/{comicId}/chapters
PUT    /api/chapters/{id}
DELETE /api/chapters/{id}
```

## Comment

```text
GET  /api/comics/{comicId}/comments
POST /api/comics/{comicId}/comments
PUT  /api/comments/{id}
DELETE /api/comments/{id}
```

## Rating

```text
POST /api/comics/{comicId}/ratings
GET  /api/comics/{comicId}/ratings
```

## Bookmark

```text
POST   /api/comics/{comicId}/bookmark
DELETE /api/comics/{comicId}/bookmark
GET    /api/users/me/bookmarks
```

## Reading History

```text
POST /api/history
GET  /api/users/me/history
```

## Moderator

```text
GET  /api/moderator/pending-comics
POST /api/moderator/comics/{id}/approve
POST /api/moderator/comics/{id}/reject
```

## Admin

```text
GET    /api/admin/users
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
```

AI API sẽ bổ sung sau khi hệ thống core hoạt động ổn.

---

# 13. AI dự kiến

AI không phải tính năng đầu tiên.

Sau khi hệ thống chính hoàn thành, có thể tích hợp:

## AI Recommendation

Người dùng nhập:

```text
"Tôi muốn đọc truyện fantasy,
main character mạnh dần lên,
có phiêu lưu và một chút romance."
```

AI phân tích sở thích và đề xuất comic.

## AI Summary

AI tạo:

- Tóm tắt comic
- Tóm tắt chapter
- Short description

## AI Author Assistant

Hỗ trợ:

- Tên truyện
- Synopsis
- Character ideas
- Chapter ideas
- Tags

## AI Moderation Assistant

AI có thể đánh dấu:

```text
COMMENT
   ↓
AI CHECK
   ↓
Potential violation?
   ↓
MODERATOR
   ↓
Final decision
```

AI chỉ hỗ trợ moderator, không nên để AI tự quyết định hoàn toàn.

---

# 14. Không cần WebSocket ở MVP

ComicHub chủ yếu là:

```text
Request
   ↓
Response
```

Ví dụ:

```text
React
  ↓
GET /api/comics
  ↓
Spring Boot
  ↓
SQL Server
  ↓
JSON
  ↓
React
```

WebSocket phù hợp hơn với các chức năng realtime như:

- Chat
- Multiplayer
- Live notification
- Realtime collaboration

Vì vậy chưa cần đưa WebSocket vào ComicHub giai đoạn đầu.

---

# 15. MVP đề xuất

## Milestone 1 - Project setup

- Tạo React
- Tạo Spring Boot
- Kết nối SQL Server
- Git
- Cấu trúc project

## Milestone 2 - Database

- Thiết kế ERD
- Tạo tables
- Foreign keys
- Seed data

## Milestone 3 - Comic

- Comic CRUD
- Category
- Chapter
- Chapter pages
- Reader

## Milestone 4 - Authentication

- Register
- Login
- Password security
- Role

## Milestone 5 - User

- Comment
- Rating
- Bookmark
- History

## Milestone 6 - Author

- Author dashboard
- Create comic
- Create chapter
- Submit moderation

## Milestone 7 - Moderator

- Pending comics
- Approve
- Reject
- Comment moderation

## Milestone 8 - Admin

- User management
- Role management
- Category management
- Statistics

## Milestone 9 - AI

- AI summary
- AI recommendation
- AI author assistant
- AI moderation assistant

---

# 16. Những thứ chưa cần làm

Trong MVP chưa cần:

- Microservices
- Kubernetes
- Kafka
- Redis
- WebSocket
- Clean Architecture
- Event-driven architecture
- Hệ thống recommendation quá phức tạp
- AI agent phức tạp

Có thể bổ sung sau nếu muốn biến project thành portfolio nâng cao.

---

# 17. Deployment

Không bắt buộc phải mua domain.

Có thể bắt đầu bằng:

```text
Frontend
    ↓
Hosting / Vercel / tương tự

Backend
    ↓
Cloud server / hosting

Database
    ↓
SQL Server hoặc dịch vụ database phù hợp
```

Domain riêng chỉ là phần bổ sung để website chuyên nghiệp hơn.

---

# 18. Giá trị của project

Project này giúp luyện đồng thời:

- Java
- Spring Boot
- Spring MVC
- REST API
- JPA / Hibernate
- SQL Server
- React
- TypeScript
- Authentication
- Authorization / RBAC
- CRUD
- File upload
- Database design
- API integration
- Testing
- Git
- Deployment
- AI integration

Quan trọng hơn, project được xây dựng theo một quy trình phát triển phần mềm tương đối đầy đủ thay vì chỉ làm một CRUD demo.

---

# 19. Nguyên tắc phát triển

Ưu tiên:

```text
Business requirement
        ↓
Database / ERD
        ↓
Backend API
        ↓
Frontend
        ↓
Testing
        ↓
Deployment
        ↓
AI / Advanced features
```

Không nên cố làm tất cả tính năng ngay từ đầu.

Mục tiêu trước tiên:

**Làm một ComicHub nhỏ nhưng chạy hoàn chỉnh.**

Sau đó mới mở rộng.
