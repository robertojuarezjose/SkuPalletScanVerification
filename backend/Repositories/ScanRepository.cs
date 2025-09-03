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
            count(p.id) as PalletCount,
            count(distinct sk.code) as SkuUniqueCount,
            count(sk.id) as SkuCount,
            sum(sk.quantity) as TotalPieces,
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
        var sql = @"insert into scan (scan_control_number, scan_date, scan_finished, scan_finished_date)
                    values (@ScanControlNumber, getdate(), 0, null);";
        return await conn.QuerySingleAsync<Scan>(sql, scan);
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
