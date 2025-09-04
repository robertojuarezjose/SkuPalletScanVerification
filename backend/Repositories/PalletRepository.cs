using System.Data;
using Dapper;
using MAD.WebApi.Data;
using MAD.WebApi.Entities;

namespace MAD.WebApi.Repositories;

public class PalletRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public PalletRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Entities.Pallet[]> Get()
    {
        using var conn = _connectionFactory.Create();
        var rows = await conn.QueryAsync<Pallet>("select * from pallet");
        return rows.ToArray();
    }
    
    public async Task<Pallet?> Get(int id)
    {
        using var conn = _connectionFactory.Create();
        return await conn.QuerySingleOrDefaultAsync<Pallet>("select * from pallet where id = @id", new { id });
    }

    public async Task<Pallet[]> GetPalletsByScanId(int scanId)
    {
        using var conn = _connectionFactory.Create();
        var sql = @"
            select 
                p.id,
                p.scan_id as scan_id,
                p.pallet_number as pallet_number,
                p.date_created as date_created,
                cast(coalesce(sum(sk.quantity), 0) as int) as total_quantity,
                cast(coalesce(sum(sk.ScanCount), 0) as int) as total_scan_count
            from pallet p
            left join sku sk on sk.pallet_id = p.id
            where p.scan_id = @scanId
            group by p.id, p.scan_id, p.pallet_number, p.date_created
            order by p.id asc
        ";
        var rows = await conn.QueryAsync<Pallet>(sql, new { scanId });
        return rows.ToArray();
    }
    
    public async Task<Pallet> Insert(Pallet pallet)
    {
        using var conn = _connectionFactory.Create();
        var id = await conn.ExecuteScalarAsync<int>(@"insert into pallet (scan_id, pallet_number, date_created)
                                                    values (@ScanId, @PalletNumber, @DateCreated);
                                                    select cast(scope_identity() as int);", pallet);
        return await conn.QuerySingleAsync<Pallet>("select * from pallet where id = @id", new { id });
    }
    
    public async Task Update(Pallet pallet)
    {
        using var conn = _connectionFactory.Create();
        var sql = @"update pallet 
                    set pallet_number = @PalletNumber
                    where id = @Id";
        await conn.ExecuteAsync(sql, pallet);
    }
    
    public async Task Delete(int id)
    {
        using var conn = _connectionFactory.Create();
        var sql = @"
        delete from sku where pallet_id = @id
        delete from pallet where id = @id
        
        
        ";
        await conn.ExecuteAsync(sql, new { id });
    }

    public string GetNextPalletNumber(int scanId)
    {
        using var conn = _connectionFactory.Create();
        var sql = @"
                    declare @t table (n int);
                    update scan
                      set scanConsecutiveNumber = isnull(scanConsecutiveNumber, 0) + 1
                      output inserted.scanConsecutiveNumber into @t
                    where id = @scanId;

                    select 'P' + right('000000' + cast(n as varchar(20)), 6) from @t;
                    
                    ";
        return conn.QuerySingle<string>(sql, new { scanId });
    }

   
}
