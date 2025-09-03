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
        var rows = await conn.QueryAsync<Pallet>("select * from pallet where scan_id = @scanId", new { scanId });
        return rows.ToArray();
    }
    
    public async Task<Pallet> Insert(Pallet pallet)
    {
        using var conn = _connectionFactory.Create();
        var sql = @"insert into pallet (scan_id, pallet_number, date_created)
                    values (@ScanId, @PalletNumber, @DateCreated);";
        return await conn.QuerySingleAsync<Pallet>(sql, pallet);
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
