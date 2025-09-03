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

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
            [
                new Claim(JwtRegisteredClaimNames.Name, request.UserName),
                new Claim(ClaimTypes.Role, userAccount.Role ?? "User")
            ]),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha512Signature),
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var securityToken = tokenHandler.CreateToken(tokenDescriptor);
        var accessToken = tokenHandler.WriteToken(securityToken);

        return new LoginResponseModel
        {
            AccessToken = accessToken,
            UserName = request.UserName,
            Role = userAccount.Role
        };
    }
}
