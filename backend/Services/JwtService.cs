using MAD.WebApi.Models;
using MAD.WebApi.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MAD.WebApi.Services;

public class JwtService(IConfiguration configuration, UserAccountRepository userAccountRepository)
{
    public async Task<LoginResponseModel?> Authenticate(LoginRequestModel request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
            return null;

        var userAccount = await userAccountRepository.GetByUserName(request.UserName);
        if (userAccount is null || request.Password != userAccount.Password)
            return null;

        var issuer = configuration["JwtConfig:Issuer"];
        var audience = configuration["JwtConfig:Audience"];
        var key = configuration["JwtConfig:Key"]!;

        // Add whatever you’ll need to read on /currentuser as claims here
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Name, request.UserName),
            new(ClaimTypes.Role, userAccount.Role ?? "User")
            // e.g. new("displayName", userAccount.DisplayName ?? "")
            // e.g. new(JwtRegisteredClaimNames.Sub, userAccount.Id.ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = issuer,
            Audience = audience,
            Expires = DateTime.UtcNow.AddHours(12), // important
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha512Signature)
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);
        var accessToken = handler.WriteToken(token);

        return new LoginResponseModel
        {
            AccessToken = accessToken,
            UserName = request.UserName,
            Role = userAccount.Role
        };
    }
}
