using System.Data;
using Microsoft.Data.SqlClient;

namespace MAD.WebApi.Data;

public interface ISqlConnectionFactory
{
    IDbConnection Create();
}

public sealed class SqlConnectionFactory : ISqlConnectionFactory
{
    private readonly string _connectionString;

    public SqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DbConnection")!;
    }

    public IDbConnection Create() => new SqlConnection(_connectionString);
}


