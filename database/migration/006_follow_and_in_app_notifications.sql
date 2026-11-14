USE comichub;
GO

SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.follows', 'U') IS NULL
BEGIN
    ;THROW 50000, 'Follows table must exist before applying this migration.', 1;
END;
GO

IF COL_LENGTH('dbo.follows', 'target_type') IS NULL
BEGIN
    ALTER TABLE dbo.follows
        ADD target_type VARCHAR(20) NOT NULL
            CONSTRAINT DF_follows_target_type DEFAULT 'COMIC' WITH VALUES;
END;
GO

IF COL_LENGTH('dbo.follows', 'creator_id') IS NULL
BEGIN
    ALTER TABLE dbo.follows ADD creator_id BIGINT NULL;
END;
GO

IF EXISTS (
    SELECT 1
    FROM sys.key_constraints
    WHERE name = 'UQ_follows_user_comic'
      AND parent_object_id = OBJECT_ID('dbo.follows')
)
BEGIN
    ALTER TABLE dbo.follows DROP CONSTRAINT UQ_follows_user_comic;
END;
GO

IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.follows')
      AND name = 'comic_id'
      AND is_nullable = 0
)
BEGIN
    ALTER TABLE dbo.follows ALTER COLUMN comic_id BIGINT NULL;
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_follows_creator'
      AND parent_object_id = OBJECT_ID('dbo.follows')
)
BEGIN
    ALTER TABLE dbo.follows
        ADD CONSTRAINT FK_follows_creator
            FOREIGN KEY (creator_id) REFERENCES dbo.users(id);
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_follows_target'
      AND parent_object_id = OBJECT_ID('dbo.follows')
)
BEGIN
    ALTER TABLE dbo.follows
        ADD CONSTRAINT CK_follows_target CHECK (
            (target_type = 'COMIC' AND comic_id IS NOT NULL AND creator_id IS NULL)
            OR (target_type = 'CREATOR' AND comic_id IS NULL AND creator_id IS NOT NULL)
        );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_follows_user_comic'
      AND object_id = OBJECT_ID('dbo.follows')
)
BEGIN
    CREATE UNIQUE INDEX UX_follows_user_comic
        ON dbo.follows (user_id, comic_id)
        WHERE target_type = 'COMIC';
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_follows_user_creator'
      AND object_id = OBJECT_ID('dbo.follows')
)
BEGIN
    CREATE UNIQUE INDEX UX_follows_user_creator
        ON dbo.follows (user_id, creator_id)
        WHERE target_type = 'CREATOR';
END;
GO

IF OBJECT_ID('dbo.notifications', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.notifications (
        id          BIGINT       IDENTITY(1,1) NOT NULL,
        user_id     BIGINT       NOT NULL,
        chapter_id  BIGINT       NOT NULL,
        type        VARCHAR(30)  NOT NULL CONSTRAINT DF_notifications_type DEFAULT 'NEW_CHAPTER',
        created_at  DATETIME2    NOT NULL CONSTRAINT DF_notifications_created_at DEFAULT SYSDATETIME(),
        read_at     DATETIME2    NULL,
        CONSTRAINT PK_notifications PRIMARY KEY (id),
        CONSTRAINT UQ_notifications_user_chapter UNIQUE (user_id, chapter_id),
        CONSTRAINT FK_notifications_user
            FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE,
        CONSTRAINT FK_notifications_chapter
            FOREIGN KEY (chapter_id) REFERENCES dbo.chapters(id) ON DELETE CASCADE,
        CONSTRAINT CK_notifications_type CHECK (type IN ('NEW_CHAPTER'))
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_notifications_user_read_created'
      AND object_id = OBJECT_ID('dbo.notifications')
)
BEGIN
    CREATE INDEX IX_notifications_user_read_created
        ON dbo.notifications (user_id, read_at, created_at DESC);
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_follows_creator_id'
      AND object_id = OBJECT_ID('dbo.follows')
)
BEGIN
    CREATE INDEX IX_follows_creator_id ON dbo.follows (creator_id);
END;
GO
