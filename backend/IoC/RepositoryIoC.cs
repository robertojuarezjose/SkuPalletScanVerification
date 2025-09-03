using MAD.WebApi.Repositories;

namespace MAD.WebApi.IoC;

public static class RepositoryIoC
{
    public static void AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<ScanRepository>();
        services.AddScoped<PalletRepository>();
        services.AddScoped<SkuRepository>();
        services.AddScoped<UserAccountRepository>();
    }
}
