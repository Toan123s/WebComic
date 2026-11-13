USE comichub;
GO

IF OBJECT_ID('dbo.chapter_revisions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.chapter_revisions (
        id              BIGINT        IDENTITY(1,1) NOT NULL,
        chapter_id      BIGINT        NOT NULL,
        submitted_by    BIGINT        NOT NULL,
        chapter_number  DECIMAL(6,1)  NOT NULL,
        title           NVARCHAR(200) NULL,
        status          VARCHAR(20)   NOT NULL
            CONSTRAINT DF_chapter_revisions_status DEFAULT 'DRAFT',
        reject_reason   NVARCHAR(500) NULL,
        reviewed_by     BIGINT        NULL,
        submitted_at    DATETIME2     NOT NULL
            CONSTRAINT DF_chapter_revisions_submitted_at DEFAULT SYSDATETIME(),
        reviewed_at     DATETIME2     NULL,
        CONSTRAINT PK_chapter_revisions PRIMARY KEY (id),
        CONSTRAINT FK_chapter_revisions_chapter
            FOREIGN KEY (chapter_id) REFERENCES dbo.chapters(id) ON DELETE CASCADE,
        CONSTRAINT FK_chapter_revisions_submitted_by
            FOREIGN KEY (submitted_by) REFERENCES dbo.users(id),
        CONSTRAINT FK_chapter_revisions_reviewed_by
            FOREIGN KEY (reviewed_by) REFERENCES dbo.users(id),
        CONSTRAINT CK_chapter_revisions_status
            CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'))
    );
END;
GO

IF OBJECT_ID('dbo.chapter_revision_pages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.chapter_revision_pages (
        id                     BIGINT        IDENTITY(1,1) NOT NULL,
        revision_id            BIGINT        NOT NULL,
        page_number            INT           NOT NULL,
        image_url              NVARCHAR(500) NOT NULL,
        width                  INT           NULL,
        height                 INT           NULL,
        file_size              BIGINT        NULL,
        uploaded_for_revision  BIT           NOT NULL
            CONSTRAINT DF_chapter_revision_pages_uploaded DEFAULT 0,
        CONSTRAINT PK_chapter_revision_pages PRIMARY KEY (id),
        CONSTRAINT UQ_chapter_revision_pages_revision_page
            UNIQUE (revision_id, page_number),
        CONSTRAINT FK_chapter_revision_pages_revision
            FOREIGN KEY (revision_id)
            REFERENCES dbo.chapter_revisions(id) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_chapter_revisions_active_chapter'
      AND object_id = OBJECT_ID('dbo.chapter_revisions')
)
BEGIN
    CREATE UNIQUE INDEX UX_chapter_revisions_active_chapter
        ON dbo.chapter_revisions (chapter_id)
        WHERE status IN ('DRAFT', 'PENDING');
END;
GO
