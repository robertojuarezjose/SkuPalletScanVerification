using MAD.WebApi.Models;
using MAD.WebApi.Services;

namespace MAD.WebApi.Endpoints;

public static class AuthenticationEndpoints
{
    public static void MapAuthenticationEndpoints(this WebApplication app)
    {
        app.MapPost("/api/login", async (LoginRequestModel request, JwtService jwtService) =>
        {
            var loginResponse = await jwtService.Authenticate(request);
            return loginResponse is not null ? Results.Ok(loginResponse) : Results.Unauthorized();
        });
    }
}
