using System.Data;
using Dapper;
using MAD.WebApi.Data;
using MAD.WebApi.Entities;

namespace MAD.WebApi.Repositories;

public class ScanRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public ScanRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Entities.Scan[]> Get()
    {
        using var conn = _connectionFactory.Create();
        var rows = await conn.QueryAsync<Scan>("select * from scan");
        return rows.ToArray();
    }

    public async Task<Entities.Scan[]> GetByStatus(string? status)
    {
        // status: "pending", "finished", "all" or null
        var normalized = status?.Trim().ToLowerInvariant();
        bool? finished = normalized switch
        {
            "pending" => false,
            "finished" => true,
            _ => null
        };

        using var conn = _connectionFactory.Create();
        if (finished is null)
        {
            var all = await conn.QueryAsync<Scan>("select * from scan");
            return all.ToArray();
        }
        else
        {
            var filtered = await conn.QueryAsync<Scan>("select * from scan where scan_finished = @finished", new { finished });
            return filtered.ToArray();
        }
    }

    public async Task<Entities.Scan[]> GetByFilters(string? status, DateTime? fromDate, DateTime? toDate)
    {
        // status: "pending", "finished", "all" or null
        var normalized = status?.Trim().ToLowerInvariant();
        bool? finished = normalized switch
        {
            "pending" => false,
            "finished" => true,
            _ => null
        };

        using var conn = _connectionFactory.Create();

        // Build dynamic SQL
        var sql = "select * from scan where 1=1";
        var parameters = new DynamicParameters();

        if (finished is not null)
        {
            sql += " and scan_finished = @finished";
            parameters.Add("finished", finished, DbType.Boolean);
        }

        // If pending and dates are null, do not filter by date (bring all pending)
        var shouldFilterByDate = !(finished == false && fromDate is null && toDate is null);
        if (shouldFilterByDate && fromDate is not null && toDate is not null)
        {
            // Compare by date only (inclusive)
            sql += " and cast(scan_date as date) between cast(@fromDate as date) and cast(@toDate as date)";
            parameters.Add("fromDate", fromDate, DbType.Date);
            parameters.Add("toDate", toDate, DbType.Date);
        }

        var rows = await conn.QueryAsync<Scan>(sql, parameters);
        return rows.ToArray();
    }

    public async Task<String?> GetNewScanControlNumber()
    {
        using var conn = _connectionFactory.Create();
        var sql = @"
            update ScanConfig
            set
                consecutive = case when [year] = year(getutcdate()) then consecutive + 1 else 1 end,
                [year] = case when [year] = year(getutcdate()) then [year] else year(getutcdate()) end
            output 'SC'
                + right('0000000000' + cast(inserted.consecutive as varchar(10)), 10)
                + cast(inserted.[year] as varchar(4));
        ";

        var result = await conn.QuerySingleOrDefaultAsync<string>(sql);
        return result;
    }
    
    public async Task<Scan?> Get(int id)
    {
        using var conn = _connectionFactory.Create();
        return await conn.QuerySingleOrDefaultAsync<Scan>("select * from scan where id = @id", new { id });
    }

    public async Task<ScanResults> GetScanResults(int scanId)
    {
        using var conn = _connectionFactory.Create();
        var sql = @"
        select 
            count(distinct p.id) as PalletCount,
            count(distinct sk.code) as SkuUniqueCount,
            count(sk.id) as SkuCount,
            coalesce(sum(sk.quantity), 0) as TotalPieces,
            MAX(s.scan_date) as DateCreated,
            MAX(s.scan_finished_date) as DateFinished,
            MAX(s.id) as ScanId,
            MAX(s.scan_control_number) as ScanControlNumber

        from scan s
        left join pallet p on s.id = p.scan_id
        left join sku sk on p.id = sk.pallet_id
        where s.id = @scanId
        ";
        return await conn.QuerySingleAsync<ScanResults>(sql, new { scanId });
    }
    
    public async Task<Scan> Insert(Scan scan)
    {
        using var conn = _connectionFactory.Create();
        var id = await conn.ExecuteScalarAsync<int>(@"insert into scan (scan_control_number, scan_date, scan_finished, scan_finished_date)
                                                    values (@ScanControlNumber, getdate(), 0, null);
                                                    select cast(scope_identity() as int);", scan);
        return await conn.QuerySingleAsync<Scan>("select * from scan where id = @id", new { id });
    }
    
    public async Task Update(Scan scan)
    {
        using var conn = _connectionFactory.Create();
        var sql = @"update scan
                    set scan_control_number = @ScanControlNumber,
                    scan_date = @ScanDate,
                    scan_finished = @ScanFinished,
                    scan_finished_date = @ScanFinishedDate
                    where id = @Id";
        await conn.ExecuteAsync(sql, scan);
    }

    public async Task Delete(int id)
    {
        using var conn = _connectionFactory.Create();
        var sql = @"
        delete from sku where pallet_id in (select id from pallet where scan_id = @id)
        delete from pallet where scan_id = @id
        delete from scan where id = @id             
        ";
        await conn.ExecuteAsync(sql, new { id });
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

   
}
