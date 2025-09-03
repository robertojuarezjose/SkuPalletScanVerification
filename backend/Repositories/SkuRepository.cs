using System;
using Dapper;
using MAD.WebApi.Data;
using MAD.WebApi.Entities;

namespace MAD.WebApi.Repositories;

public class SkuRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public SkuRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Entities.Sku[]> Get()
    {
        using var conn = _connectionFactory.Create();
        var rows = await conn.QueryAsync<Sku>("select * from sku");
        return rows.ToArray();
    }

    public async Task<Sku?> Get(int id)
    {
        using var conn = _connectionFactory.Create();
        return await conn.QuerySingleOrDefaultAsync<Sku>("select * from sku where id = @id", new { id });
    }

    public async Task Insert(Sku sku)
    {
        using var conn = _connectionFactory.Create();
        var sql = @"insert into sku (code, quantity, pallet_id, date_created)
                    values (@code, @Quantity, @PalletId, @DateCreated);";
        await conn.ExecuteAsync(sql, sku);
    }

    public async Task<Sku[]> GetSkusByPalletId(int palletId)
    {
        using var conn = _connectionFactory.Create();
        var rows = await conn.QueryAsync<Sku>("select * from sku where pallet_id = @palletId", new { palletId });
        return rows.ToArray();
    }

    public async Task Update(Sku sku){
        using var conn = _connectionFactory.Create();
        var sql = @"update sku
                    set code = @code,
                    quantity = @Quantity,
                    pallet_id = @PalletId,
                    date_created = @DateCreated
                    where id = @Id";
        await conn.ExecuteAsync(sql, sku);
    }

    public async Task Delete(int id){
        using var conn = _connectionFactory.Create();
        var sql = @"delete from sku where id = @id";
        await conn.ExecuteAsync(sql, new { id });
    }
}

