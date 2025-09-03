using System.Text;
using Dapper;
using MAD.WebApi.Data;
using MAD.WebApi.Endpoints;
using MAD.WebApi.IoC;
using MAD.WebApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ---------- Services ----------
builder.Services.AddRepositories();
builder.Services.AddScoped<DatabaseInitializer>();
builder.Services.AddScoped<JwtService>();

// CORS (from appsettings)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Dapper: snake_case -> PascalCase
DefaultTypeMap.MatchNamesWithUnderscores = true;

// Dapper connection factory
builder.Services.AddSingleton<ISqlConnectionFactory, SqlConnectionFactory>();

// ---------- AuthN/AuthZ (JWT from cookie or Authorization header) ----------
var issuer    = builder.Configuration["JwtConfig:Issuer"];
var audience  = builder.Configuration["JwtConfig:Audience"];
var keyConfig = builder.Configuration["JwtConfig:Key"]!;

byte[] keyBytes;
try
{
    keyBytes = Convert.FromBase64String(keyConfig); // recommended
}
catch
{
    keyBytes = Encoding.UTF8.GetBytes(keyConfig);   // fallback if not Base64
}
var signingKey = new SymmetricSecurityKey(keyBytes);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // set true in prod behind HTTPS
        options.SaveToken = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = signingKey,
            ValidateIssuer           = true,
            ValidIssuer              = issuer,   // EXACT match with token creation
            ValidateAudience         = true,
            ValidAudience            = audience, // EXACT match
            ValidateLifetime         = true,
            ClockSkew                = TimeSpan.Zero
        };

        // Read JWT from cookie "auth" if no Authorization header
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (string.IsNullOrEmpty(ctx.Token) &&
                    ctx.Request.Cookies.TryGetValue("auth", out var cookieToken))
                {
                    ctx.Token = cookieToken;
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = ctx =>
            {
                Console.WriteLine($"JWT auth failed: {ctx.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ---------- Swagger ----------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "MAD.WebApi", Version = "v1" });

    // Bearer scheme stays for header-based testing; cookies work automatically in-browser
    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        Scheme = "bearer",
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Reference = new OpenApiReference { Id = "Bearer", Type = ReferenceType.SecurityScheme }
    };

    options.AddSecurityDefinition("Bearer", jwtSecurityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>() }
    });
});

var app = builder.Build();

// ---------- DB init ----------
using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
    await initializer.InitializeAsync();
}

// ---------- Middleware ----------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MAD.WebApi v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.UseCors("frontend");
app.UseAuthentication();   // must be before UseAuthorization
app.UseAuthorization();

// ---------- Endpoints ----------
app.MapPalletEndpoints();
app.MapSkuEndpoints();
app.MapScanEndpoints();
app.MapAuthenticationEndpoints();

await app.RunAsync();
