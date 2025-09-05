using System.Text;
using Dapper;
using Microsoft.AspNetCore.Hosting;
using MAD.WebApi.Data;
using MAD.WebApi.Endpoints;
using MAD.WebApi.IoC;
using MAD.WebApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
// Bindings are controlled by IIS/ANCM in production; avoid hardcoding there
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://localhost:5065");
}

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

// IMPORTANT: Must match JwtService signing exactly (UTF8 of raw string)
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyConfig));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
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
    try
    {
        await initializer.InitializeAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Startup] Database initialization failed: {ex.Message}");
        // Continue running so non-DB endpoints and dev can still start
    }
}

// ---------- Middleware ----------
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MAD.WebApi v1");
        c.RoutePrefix = "swagger";
    });
}

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseCors("frontend");
app.UseAuthentication();   // must be before UseAuthorization
app.UseAuthorization();

// ---------- Endpoints ----------
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapPalletEndpoints();
app.MapSkuEndpoints();
app.MapScanEndpoints();
app.MapAuthenticationEndpoints();

// SPA fallback to index.html
app.MapFallbackToFile("index.html");

await app.RunAsync();
