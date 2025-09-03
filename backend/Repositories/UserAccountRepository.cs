using System.Data;
using Dapper;
using MAD.WebApi.Data;
using MAD.WebApi.Entities;

namespace MAD.WebApi.Repositories;

public class UserAccountRepository
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public UserAccountRepository(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<UserAccount?> GetByUserName(string userName)
    {
        using var conn = _connectionFactory.Create();
        return await conn.QuerySingleOrDefaultAsync<UserAccount>(
            "select * from user_account where user_name = @userName",
            new { userName });
    }
}
