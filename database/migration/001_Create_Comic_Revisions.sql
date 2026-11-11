USE comichub;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ARITHABORT ON;
SET NUMERIC_ROUNDABORT OFF;
GO

IF OBJECT_ID('dbo.comic_revisions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.comic_revisions (
        id                  BIGINT         IDENTITY(1,1) NOT NULL,
        comic_id            BIGINT         NOT NULL,
        submitted_by        BIGINT         NOT NULL,
        title               NVARCHAR(200)  NOT NULL,
        description         NVARCHAR(MAX)  NULL,
        cover_url           NVARCHAR(500)  NULL,
        publication_status  VARCHAR(20)    NOT NULL,
        status              VARCHAR(20)    NOT NULL
            CONSTRAINT DF_comic_revisions_status DEFAULT 'PENDING',
        reject_reason       NVARCHAR(500)  NULL,
        reviewed_by         BIGINT         NULL,
        submitted_at        DATETIME2      NOT NULL
            CONSTRAINT DF_comic_revisions_submitted_at DEFAULT SYSDATETIME(),
        reviewed_at         DATETIME2      NULL,
        CONSTRAINT PK_comic_revisions PRIMARY KEY (id),
        CONSTRAINT FK_comic_revisions_comic
            FOREIGN KEY (comic_id) REFERENCES dbo.comics(id) ON DELETE CASCADE,
        CONSTRAINT FK_comic_revisions_submitted_by
            FOREIGN KEY (submitted_by) REFERENCES dbo.users(id),
        CONSTRAINT FK_comic_revisions_reviewed_by
            FOREIGN KEY (reviewed_by) REFERENCES dbo.users(id),
        CONSTRAINT CK_comic_revisions_status
            CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
        CONSTRAINT CK_comic_revisions_publication_status
            CHECK (publication_status IN ('ONGOING', 'COMPLETED', 'HIATUS'))
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_comic_revisions_pending_comic'
      AND object_id = OBJECT_ID('dbo.comic_revisions')
)
BEGIN
    CREATE UNIQUE INDEX UX_comic_revisions_pending_comic
        ON dbo.comic_revisions (comic_id)
        WHERE status = 'PENDING';
END;
GO
