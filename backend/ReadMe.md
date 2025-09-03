if not exists (select * from sysobjects where name='user_account' and xtype='U')
begin
    create table user_account (
        id int identity(1,1) primary key,
        full_name nvarchar(100) null,
        user_name nvarchar(100) not null unique,
        password nvarchar(200) not null,
        role nvarchar(50) null
    );
end;

if not exists (select * from sysobjects where name='ScanConfig' and xtype='U')
begin
    create table ScanConfig (
        id int identity(1,1) primary key,
        consecutive int not null,
        [year] int not null
    );
end;

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
end;

if not exists (select * from sysobjects where name='pallet' and xtype='U')
begin
    create table pallet (
        id int identity(1,1) primary key,
        scan_id nvarchar(100) not null,
        pallet_number nvarchar(100) null,
        date_created datetime2 not null constraint DF_pallet_date_created default (sysutcdatetime())
    );
end;

if not exists (select * from sysobjects where name='sku' and xtype='U')
begin
    create table sku (
        id int identity(1,1) primary key,
        code nvarchar(100) null,
        quantity int null,
        pallet_id int null,
        date_created datetime2 not null constraint DF_sku_date_created default (sysutcdatetime())
    );
end;

-- Rename old column 'sku' to 'code' if needed (for existing databases)
if exists (select * from sysobjects where name='sku' and xtype='U')
   and exists (select 1 from sys.columns where object_id = object_id('dbo.sku') and name = 'sku')
   and not exists (select 1 from sys.columns where object_id = object_id('dbo.sku') and name = 'code')
begin
    exec sp_rename 'dbo.sku.sku', 'code', 'COLUMN';
end;

if not exists (select 1 from ScanConfig)
begin
    insert into ScanConfig (consecutive, [year]) values (0, year(getutcdate()));
end;

if not exists (select 1 from user_account where user_name = 'admin')
begin
    insert into user_account (full_name, user_name, password, role)
    values ('Admin User', 'admin', 'admin123', 'Administrator');
end;

IF NOT EXISTS (
  SELECT 1
  FROM sys.default_constraints dc
  JOIN sys.columns c ON c.default_object_id = dc.object_id
  WHERE dc.parent_object_id = OBJECT_ID('scan')
    AND c.name = 'scan_finished'
)
BEGIN
  ALTER TABLE scan
    ADD CONSTRAINT DF_scan_scan_finished DEFAULT (0) FOR scan_finished;
END