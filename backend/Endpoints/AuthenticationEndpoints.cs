using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MAD.WebApi.Models;
using MAD.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace MAD.WebApi.Endpoints;

public static class AuthenticationEndpoints
{
    private const string AuthCookieName = "auth";

    public static void MapAuthenticationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");

        // Public
        group.MapPost("login", Login).AllowAnonymous();

        // Auth required (or allow anonymous if you just want to clear the cookie regardless)
        group.MapPost("logout", Logout).RequireAuthorization();
        group.MapGet("currentuser", CurrentUser).RequireAuthorization();
    }

    private static async Task<IResult> Login(
        HttpContext http,
        [FromBody] LoginRequestModel loginRequest,
        [FromServices] JwtService jwtService,
        [FromQuery] bool useCookies = true)
    {
        var loginResponse = await jwtService.Authenticate(loginRequest);
        if (loginResponse is null) return Results.Unauthorized();

        // NOTE: Change this to the actual token property your JwtService returns.
        var token =
            (loginResponse as dynamic)?.AccessToken ??
            (loginResponse as dynamic)?.Token as string;

        if (string.IsNullOrWhiteSpace(token))
            return Results.Problem("Token missing from login response.", statusCode: 500);

        if (useCookies)
        {
            // In dev you can keep Secure=false if you're on http;
            // if you're serving https locally, set Secure=true.
            var isHttps = http.Request.IsHttps;

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = isHttps,              // true in prod; for dev depends on HTTPS
                SameSite = SameSiteMode.Lax,   // Strict/Lax for same-site; use None+Secure for cross-site
                Expires = DateTimeOffset.UtcNow.AddHours(1) // match your JWT lifetime
            };

            http.Response.Cookies.Append(AuthCookieName, token, cookieOptions);

            
            
        }

        // Non-cookie mode: return full response (including token) for SPA in-memory storage
        return Results.Ok(loginResponse);
    }



    private static IResult Logout(HttpContext http)
    {
        // Use the SAME Path/Domain/SameSite you used when creating the cookie,
        // otherwise the browser may not remove it.
        var opts = new CookieOptions
        {
            HttpOnly = true,
            Secure = http.Request.IsHttps,   // or true if you always serve over HTTPS
            SameSite = SameSiteMode.Lax,     // match what you used on append
            Path = "/"                       // match creation Path (commonly "/")
            // Domain = "yourdomain.com"     // include if you set it on creation
        };

        http.Response.Cookies.Delete(AuthCookieName, opts);
        return Results.Ok(new { message = "Logged out" });
    }


    // Pull the ClaimsPrincipal directly from DI binding
    private static IResult CurrentUser(ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userName =
            user.FindFirstValue(ClaimTypes.Name) ??
            user.FindFirstValue(JwtRegisteredClaimNames.Name) ??
            user.Identity?.Name;

        if (string.IsNullOrWhiteSpace(userName))
            return Results.Unauthorized();

        var role = user.FindFirstValue(ClaimTypes.Role);

        return Results.Ok(new { UserName = userName, Role = role });
    }
}
