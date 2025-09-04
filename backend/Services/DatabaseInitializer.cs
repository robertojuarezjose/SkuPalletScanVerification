using System.Data;
using Dapper;
using MAD.WebApi.Data;

namespace MAD.WebApi.Services;

public class DatabaseInitializer
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public DatabaseInitializer(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.Create();

        const string createTableSql = @"
if not exists (select * from sysobjects where name='user_account' and xtype='U')
begin
    create table user_account (
        id int identity(1,1) primary key,
        full_name nvarchar(100) null,
        user_name nvarchar(100) not null unique,
        password nvarchar(200) not null,
        role nvarchar(50) null
    );
end
;

if not exists (select * from sysobjects where name='ScanConfig' and xtype='U')
begin
    create table ScanConfig (
        id int identity(1,1) primary key,
        consecutive int not null,
        [year] int not null
    );
end
;

if not exists (select * from sysobjects where name='scan' and xtype='U')
begin
    create table scan (
        id int identity(1,1) primary key,
        scan_control_number nvarchar(100) null,
        scanConsecutiveNumber int not null default(0),
        scan_date datetime2 null,
        scan_finished bit null,
        scan_finished_date datetime2 null
    );
end
;

if not exists (select * from sysobjects where name='pallet' and xtype='U')
begin
    create table pallet (
        id int identity(1,1) primary key,
        scan_id nvarchar(100) not null,
        pallet_number nvarchar(100) null,
        date_created datetime2 not null constraint DF_pallet_date_created default (sysutcdatetime())
    );
end
;

-- Create table if it doesn't exist (now includes ScanCount)
IF NOT EXISTS (
    SELECT 1
    FROM sys.tables
    WHERE name = 'sku' AND schema_id = SCHEMA_ID('dbo')
)
BEGIN
    CREATE TABLE dbo.sku
    (
        id           INT IDENTITY(1,1) PRIMARY KEY,
        code         NVARCHAR(100) NULL,
        quantity     INT NULL,
        pallet_id    INT NULL,
        date_created DATETIME2 NOT NULL CONSTRAINT DF_sku_date_created DEFAULT (sysutcdatetime()),
        ScanCount    INT NOT NULL CONSTRAINT DF_sku_ScanCount DEFAULT (1)
    );
END
ELSE
BEGIN
    -- Table exists: add ScanCount only if missing, backfilling existing rows with 1
    IF COL_LENGTH('dbo.sku', 'ScanCount') IS NULL
    BEGIN
        ALTER TABLE dbo.sku
        ADD ScanCount INT NOT NULL CONSTRAINT DF_sku_ScanCount DEFAULT (1) WITH VALUES;
    END
END

;

-- Rename old column 'sku' to 'code' if table exists and column hasn't been renamed yet
if exists (select * from sysobjects where name='sku' and xtype='U')
   and exists (select 1 from sys.columns where object_id = object_id('dbo.sku') and name = 'sku')
   and not exists (select 1 from sys.columns where object_id = object_id('dbo.sku') and name = 'code')
begin
    exec sp_rename 'dbo.sku.sku', 'code', 'COLUMN';
end
";

        await connection.ExecuteAsync(createTableSql);

        const string seedScanConfigSql = @"
if not exists (select 1 from ScanConfig)
begin
    insert into ScanConfig (consecutive, [year]) values (0, year(getutcdate()));
end
";

        await connection.ExecuteAsync(seedScanConfigSql);

        const string upsertUserSql = @"
if not exists (select 1 from user_account where user_name = @userName)
begin
    insert into user_account (full_name, user_name, password, role)
    values (@fullName, @userName, @password, @role);
end
";

        // Note: stored as plain for now to match JwtService comparison; hash later.
        var parameters = new
        {
            fullName = "Admin User",
            userName = "admin",
            password = "admin123",
            role = "Administrator"
        };

        await connection.ExecuteAsync(upsertUserSql, parameters);
    }
}


