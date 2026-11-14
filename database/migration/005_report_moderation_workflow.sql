USE comichub;
GO

IF OBJECT_ID('dbo.reports', 'U') IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1
        FROM sys.check_constraints
        WHERE name = 'CK_reports_status'
          AND parent_object_id = OBJECT_ID('dbo.reports')
    )
    BEGIN
        ALTER TABLE dbo.reports DROP CONSTRAINT CK_reports_status;
    END;

    UPDATE dbo.reports
    SET status = 'REJECTED'
    WHERE status = 'DISMISSED';

    ALTER TABLE dbo.reports
        ADD CONSTRAINT CK_reports_status
            CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'));
END;
GO
