/* =====================================================================
   ComicHub - Script tạo bảng (SQL Server)
   ---------------------------------------------------------------------
   Cách chạy: mở SSMS, kết nối SQL Server, mở file này rồi bấm Execute.
   CẢNH BÁO: script xóa các bảng cũ (nếu có) rồi tạo lại từ đầu,
   nên MẤT HẾT DỮ LIỆU hiện có. Chỉ dùng khi đang phát triển.
   ===================================================================== */

USE comichub;
GO

/* ---------------------------------------------------------------------
   0. Xóa bảng cũ (theo thứ tự ngược của khóa ngoại)
   --------------------------------------------------------------------- */
DROP TABLE IF EXISTS moderation_logs;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS reading_history;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS chapter_pages;
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS comic_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS comics;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
GO

/* =====================================================================
   1. NHÓM TÀI KHOẢN & PHÂN QUYỀN
   ===================================================================== */

CREATE TABLE users (
    id             BIGINT         IDENTITY(1,1) NOT NULL,
    username       NVARCHAR(50)   NOT NULL,
    email          NVARCHAR(100)  NOT NULL,
    password_hash  NVARCHAR(255)  NOT NULL,
    display_name   NVARCHAR(100)  NULL,
    avatar_url     NVARCHAR(500)  NULL,
    bio            NVARCHAR(500)  NULL,
    status         VARCHAR(20)    NOT NULL CONSTRAINT DF_users_status DEFAULT 'ACTIVE',
    last_login_at  DATETIME2      NULL,
    created_at     DATETIME2      NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSDATETIME(),
    updated_at     DATETIME2      NOT NULL CONSTRAINT DF_users_updated_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_users          PRIMARY KEY (id),
    CONSTRAINT UQ_users_username UNIQUE (username),
    CONSTRAINT UQ_users_email    UNIQUE (email),
    CONSTRAINT CK_users_status   CHECK (status IN ('ACTIVE', 'BANNED', 'INACTIVE'))
);
GO

CREATE TABLE roles (
    id           INT           IDENTITY(1,1) NOT NULL,
    name         VARCHAR(30)   NOT NULL,
    description  NVARCHAR(200) NULL,
    CONSTRAINT PK_roles      PRIMARY KEY (id),
    CONSTRAINT UQ_roles_name UNIQUE (name)
);
GO

CREATE TABLE user_roles (
    user_id      BIGINT    NOT NULL,
    role_id      INT       NOT NULL,
    assigned_at  DATETIME2 NOT NULL CONSTRAINT DF_user_roles_assigned_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_user_roles      PRIMARY KEY (user_id, role_id),
    CONSTRAINT FK_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
);
GO

CREATE TABLE refresh_tokens (
    id          BIGINT       IDENTITY(1,1) NOT NULL,
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(255) NOT NULL,
    expires_at  DATETIME2    NOT NULL,
    revoked     BIT          NOT NULL CONSTRAINT DF_refresh_tokens_revoked DEFAULT 0,
    created_at  DATETIME2    NOT NULL CONSTRAINT DF_refresh_tokens_created_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_refresh_tokens       PRIMARY KEY (id),
    CONSTRAINT UQ_refresh_tokens_token UNIQUE (token),
    CONSTRAINT FK_refresh_tokens_user  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

/* =====================================================================
   2. NHÓM TRUYỆN
   ===================================================================== */

CREATE TABLE comics (
    id                  BIGINT         IDENTITY(1,1) NOT NULL,
    author_id           BIGINT         NOT NULL,
    title               NVARCHAR(200)  NOT NULL,
    slug                VARCHAR(220)   NOT NULL,
    description         NVARCHAR(MAX)  NULL,
    cover_url           NVARCHAR(500)  NULL,
    moderation_status   VARCHAR(20)    NOT NULL CONSTRAINT DF_comics_moderation_status DEFAULT 'DRAFT',
    publication_status  VARCHAR(20)    NOT NULL CONSTRAINT DF_comics_publication_status DEFAULT 'ONGOING',
    reject_reason       NVARCHAR(500)  NULL,
    reviewed_by         BIGINT         NULL,
    reviewed_at         DATETIME2      NULL,
    submitted_at        DATETIME2      NULL,
    published_at        DATETIME2      NULL,
    view_count          BIGINT         NOT NULL CONSTRAINT DF_comics_view_count DEFAULT 0,
    rating_avg          DECIMAL(3,2)   NOT NULL CONSTRAINT DF_comics_rating_avg DEFAULT 0,
    rating_count        INT            NOT NULL CONSTRAINT DF_comics_rating_count DEFAULT 0,
    is_deleted          BIT            NOT NULL CONSTRAINT DF_comics_is_deleted DEFAULT 0,
    created_at          DATETIME2      NOT NULL CONSTRAINT DF_comics_created_at DEFAULT SYSDATETIME(),
    updated_at          DATETIME2      NOT NULL CONSTRAINT DF_comics_updated_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_comics             PRIMARY KEY (id),
    CONSTRAINT UQ_comics_slug        UNIQUE (slug),
    CONSTRAINT FK_comics_author      FOREIGN KEY (author_id)   REFERENCES users(id),
    CONSTRAINT FK_comics_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT CK_comics_moderation_status
        CHECK (moderation_status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED')),
    CONSTRAINT CK_comics_publication_status
        CHECK (publication_status IN ('ONGOING', 'COMPLETED', 'HIATUS'))
);
GO

CREATE TABLE categories (
    id           INT           IDENTITY(1,1) NOT NULL,
    name         NVARCHAR(50)  NOT NULL,
    slug         VARCHAR(60)   NOT NULL,
    description  NVARCHAR(300) NULL,
    created_at   DATETIME2     NOT NULL CONSTRAINT DF_categories_created_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_categories      PRIMARY KEY (id),
    CONSTRAINT UQ_categories_name UNIQUE (name),
    CONSTRAINT UQ_categories_slug UNIQUE (slug)
);
GO

CREATE TABLE comic_categories (
    comic_id     BIGINT NOT NULL,
    category_id  INT    NOT NULL,
    CONSTRAINT PK_comic_categories          PRIMARY KEY (comic_id, category_id),
    CONSTRAINT FK_comic_categories_comic    FOREIGN KEY (comic_id)    REFERENCES comics(id)     ON DELETE CASCADE,
    CONSTRAINT FK_comic_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
GO

CREATE TABLE chapters (
    id              BIGINT        IDENTITY(1,1) NOT NULL,
    comic_id        BIGINT        NOT NULL,
    chapter_number  DECIMAL(6,1)  NOT NULL,
    title           NVARCHAR(200) NULL,
    status          VARCHAR(20)   NOT NULL CONSTRAINT DF_chapters_status DEFAULT 'DRAFT',
    reject_reason   NVARCHAR(500) NULL,
    reviewed_by     BIGINT        NULL,
    reviewed_at     DATETIME2     NULL,
    page_count      INT           NOT NULL CONSTRAINT DF_chapters_page_count DEFAULT 0,
    view_count      BIGINT        NOT NULL CONSTRAINT DF_chapters_view_count DEFAULT 0,
    published_at    DATETIME2     NULL,
    is_deleted      BIT           NOT NULL CONSTRAINT DF_chapters_is_deleted DEFAULT 0,
    created_at      DATETIME2     NOT NULL CONSTRAINT DF_chapters_created_at DEFAULT SYSDATETIME(),
    updated_at      DATETIME2     NOT NULL CONSTRAINT DF_chapters_updated_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_chapters             PRIMARY KEY (id),
    CONSTRAINT UQ_chapters_comic_num   UNIQUE (comic_id, chapter_number),
    CONSTRAINT FK_chapters_comic       FOREIGN KEY (comic_id)    REFERENCES comics(id) ON DELETE CASCADE,
    CONSTRAINT FK_chapters_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id),
    CONSTRAINT CK_chapters_status
        CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED'))
);
GO

CREATE TABLE chapter_pages (
    id           BIGINT        IDENTITY(1,1) NOT NULL,
    chapter_id   BIGINT        NOT NULL,
    page_number  INT           NOT NULL,
    image_url    NVARCHAR(500) NOT NULL,
    width        INT           NULL,
    height       INT           NULL,
    file_size    BIGINT        NULL,
    created_at   DATETIME2     NOT NULL CONSTRAINT DF_chapter_pages_created_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_chapter_pages            PRIMARY KEY (id),
    CONSTRAINT UQ_chapter_pages_chap_page  UNIQUE (chapter_id, page_number),
    CONSTRAINT FK_chapter_pages_chapter    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);
GO

/* =====================================================================
   3. NHÓM TƯƠNG TÁC NGƯỜI DÙNG
   Ghi chú: SQL Server không cho phép nhiều đường CASCADE tới cùng một bảng,
   nên các khóa ngoại chapter_id / parent_id / user_id ở dưới để NO ACTION.
   (Dự án dùng xóa mềm cho comics, chapters, users.)
   ===================================================================== */

CREATE TABLE comments (
    id             BIGINT         IDENTITY(1,1) NOT NULL,
    user_id        BIGINT         NOT NULL,
    comic_id       BIGINT         NOT NULL,
    chapter_id     BIGINT         NULL,
    parent_id      BIGINT         NULL,
    content        NVARCHAR(1000) NOT NULL,
    status         VARCHAR(20)    NOT NULL CONSTRAINT DF_comments_status DEFAULT 'VISIBLE',
    hidden_by      BIGINT         NULL,
    hidden_reason  NVARCHAR(300)  NULL,
    created_at     DATETIME2      NOT NULL CONSTRAINT DF_comments_created_at DEFAULT SYSDATETIME(),
    updated_at     DATETIME2      NOT NULL CONSTRAINT DF_comments_updated_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_comments           PRIMARY KEY (id),
    CONSTRAINT FK_comments_user      FOREIGN KEY (user_id)    REFERENCES users(id),
    CONSTRAINT FK_comments_comic     FOREIGN KEY (comic_id)   REFERENCES comics(id) ON DELETE CASCADE,
    CONSTRAINT FK_comments_chapter   FOREIGN KEY (chapter_id) REFERENCES chapters(id),
    CONSTRAINT FK_comments_parent    FOREIGN KEY (parent_id)  REFERENCES comments(id),
    CONSTRAINT FK_comments_hidden_by FOREIGN KEY (hidden_by)  REFERENCES users(id),
    CONSTRAINT CK_comments_status    CHECK (status IN ('VISIBLE', 'HIDDEN', 'DELETED'))
);
GO

CREATE TABLE ratings (
    id          BIGINT        IDENTITY(1,1) NOT NULL,
    user_id     BIGINT        NOT NULL,
    comic_id    BIGINT        NOT NULL,
    score       TINYINT       NOT NULL,
    review      NVARCHAR(500) NULL,
    created_at  DATETIME2     NOT NULL CONSTRAINT DF_ratings_created_at DEFAULT SYSDATETIME(),
    updated_at  DATETIME2     NOT NULL CONSTRAINT DF_ratings_updated_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_ratings            PRIMARY KEY (id),
    CONSTRAINT UQ_ratings_user_comic UNIQUE (user_id, comic_id),
    CONSTRAINT FK_ratings_user       FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT FK_ratings_comic      FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    CONSTRAINT CK_ratings_score      CHECK (score BETWEEN 1 AND 5)
);
GO

CREATE TABLE bookmarks (
    id          BIGINT    IDENTITY(1,1) NOT NULL,
    user_id     BIGINT    NOT NULL,
    comic_id    BIGINT    NOT NULL,
    created_at  DATETIME2 NOT NULL CONSTRAINT DF_bookmarks_created_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_bookmarks            PRIMARY KEY (id),
    CONSTRAINT UQ_bookmarks_user_comic UNIQUE (user_id, comic_id),
    CONSTRAINT FK_bookmarks_user       FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT FK_bookmarks_comic      FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE
);
GO

CREATE TABLE follows (
    id              BIGINT    IDENTITY(1,1) NOT NULL,
    user_id         BIGINT    NOT NULL,
    comic_id        BIGINT    NOT NULL,
    notify_enabled  BIT       NOT NULL CONSTRAINT DF_follows_notify DEFAULT 1,
    created_at      DATETIME2 NOT NULL CONSTRAINT DF_follows_created_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_follows            PRIMARY KEY (id),
    CONSTRAINT UQ_follows_user_comic UNIQUE (user_id, comic_id),
    CONSTRAINT FK_follows_user       FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT FK_follows_comic      FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE
);
GO

CREATE TABLE reading_history (
    id                BIGINT    IDENTITY(1,1) NOT NULL,
    user_id           BIGINT    NOT NULL,
    comic_id          BIGINT    NOT NULL,
    chapter_id        BIGINT    NOT NULL,
    last_page_number  INT       NOT NULL CONSTRAINT DF_reading_history_page DEFAULT 1,
    read_at           DATETIME2 NOT NULL CONSTRAINT DF_reading_history_read_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_reading_history            PRIMARY KEY (id),
    CONSTRAINT UQ_reading_history_user_comic UNIQUE (user_id, comic_id),
    CONSTRAINT FK_reading_history_user       FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT FK_reading_history_comic      FOREIGN KEY (comic_id)   REFERENCES comics(id)   ON DELETE CASCADE,
    CONSTRAINT FK_reading_history_chapter    FOREIGN KEY (chapter_id) REFERENCES chapters(id)
);
GO

/* =====================================================================
   4. NHÓM KIỂM DUYỆT
   ===================================================================== */

CREATE TABLE reports (
    id               BIGINT        IDENTITY(1,1) NOT NULL,
    reporter_id      BIGINT        NOT NULL,
    target_type      VARCHAR(20)   NOT NULL,
    target_id        BIGINT        NOT NULL,
    reason           VARCHAR(30)   NOT NULL,
    description      NVARCHAR(500) NULL,
    status           VARCHAR(20)   NOT NULL CONSTRAINT DF_reports_status DEFAULT 'OPEN',
    handled_by       BIGINT        NULL,
    handled_at       DATETIME2     NULL,
    resolution_note  NVARCHAR(500) NULL,
    created_at       DATETIME2     NOT NULL CONSTRAINT DF_reports_created_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_reports             PRIMARY KEY (id),
    CONSTRAINT FK_reports_reporter    FOREIGN KEY (reporter_id) REFERENCES users(id),
    CONSTRAINT FK_reports_handled_by  FOREIGN KEY (handled_by)  REFERENCES users(id),
    CONSTRAINT CK_reports_target_type CHECK (target_type IN ('COMIC', 'CHAPTER', 'COMMENT')),
    CONSTRAINT CK_reports_reason      CHECK (reason IN ('SPAM', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER')),
    CONSTRAINT CK_reports_status      CHECK (status IN ('OPEN', 'RESOLVED', 'DISMISSED'))
);
GO

CREATE TABLE moderation_logs (
    id            BIGINT        IDENTITY(1,1) NOT NULL,
    comic_id      BIGINT        NOT NULL,
    chapter_id    BIGINT        NULL,
    moderator_id  BIGINT        NOT NULL,
    action        VARCHAR(20)   NOT NULL,
    note          NVARCHAR(500) NULL,
    created_at    DATETIME2     NOT NULL CONSTRAINT DF_moderation_logs_created_at DEFAULT SYSDATETIME(),
    CONSTRAINT PK_moderation_logs           PRIMARY KEY (id),
    CONSTRAINT FK_moderation_logs_comic     FOREIGN KEY (comic_id)     REFERENCES comics(id) ON DELETE CASCADE,
    CONSTRAINT FK_moderation_logs_chapter   FOREIGN KEY (chapter_id)   REFERENCES chapters(id),
    CONSTRAINT FK_moderation_logs_moderator FOREIGN KEY (moderator_id) REFERENCES users(id),
    CONSTRAINT CK_moderation_logs_action    CHECK (action IN ('APPROVE', 'REJECT'))
);
GO

/* =====================================================================
   5. INDEX (tăng tốc các truy vấn hay dùng)
   Các cột đã có UNIQUE/PK thì SQL Server tự tạo index, không cần thêm.
   ===================================================================== */

-- Truyện: danh sách truyện của tác giả, danh sách truyện đã publish
CREATE INDEX IX_comics_author_id        ON comics (author_id);
CREATE INDEX IX_comics_status_published ON comics (moderation_status, published_at DESC);

-- Thể loại: tìm truyện theo thể loại
CREATE INDEX IX_comic_categories_category ON comic_categories (category_id);

-- Chapter: danh sách chapter của một truyện
CREATE INDEX IX_chapters_comic_id ON chapters (comic_id);

-- Bình luận: tải bình luận của truyện / chapter / các reply
CREATE INDEX IX_comments_comic_created ON comments (comic_id, created_at DESC);
CREATE INDEX IX_comments_chapter_id    ON comments (chapter_id);
CREATE INDEX IX_comments_parent_id     ON comments (parent_id);
CREATE INDEX IX_comments_user_id       ON comments (user_id);

-- Đánh giá: tính điểm trung bình theo truyện
CREATE INDEX IX_ratings_comic_id ON ratings (comic_id);

-- Bookmark / follow / lịch sử: xem danh sách của một user
CREATE INDEX IX_bookmarks_user_id       ON bookmarks (user_id, created_at DESC);
CREATE INDEX IX_follows_comic_id        ON follows (comic_id);
CREATE INDEX IX_reading_history_user_at ON reading_history (user_id, read_at DESC);

-- Token: dọn token hết hạn, tìm token theo user
CREATE INDEX IX_refresh_tokens_user_id ON refresh_tokens (user_id);

-- Report: moderator lọc theo trạng thái, tra theo đối tượng bị report
CREATE INDEX IX_reports_status ON reports (status, created_at DESC);
CREATE INDEX IX_reports_target ON reports (target_type, target_id);

-- Log duyệt: xem lịch sử duyệt của một truyện
CREATE INDEX IX_moderation_logs_comic ON moderation_logs (comic_id, created_at DESC);
GO

PRINT N'Tao bang ComicHub thanh cong (16 bang).';
GO