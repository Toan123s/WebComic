USE comichub;
GO

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_moderation_logs_action'
      AND parent_object_id = OBJECT_ID('dbo.moderation_logs')
)
BEGIN
    ALTER TABLE dbo.moderation_logs
        DROP CONSTRAINT CK_moderation_logs_action;
END;
GO

ALTER TABLE dbo.moderation_logs
    ADD CONSTRAINT CK_moderation_logs_action
        CHECK (action IN ('APPROVE', 'REJECT', 'PUBLISH'));
GO
