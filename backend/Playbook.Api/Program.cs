using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Playbook.Api.Services;
using Playbook.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IClipVideoService, FfmpegClipVideoService>();
builder.Services.AddHttpClient();

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 524_288_000; // 500MB
});

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 524_288_000;
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var usePostgres = builder.Configuration.GetValue<string>("Database:Provider") == "PostgreSQL";
builder.Services.AddDbContext<PlaybookDbContext>(options =>
{
    if (usePostgres)
    {
        options.UseNpgsql(builder.Configuration.GetConnectionString("Default"),
            npgsql => npgsql.MigrationsAssembly("Playbook.Infrastructure"));
    }
    else
    {
        options.UseInMemoryDatabase("PlaybookDb");
    }
});

var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (corsOrigins is { Length: > 0 })
            policy.WithOrigins(corsOrigins).AllowAnyMethod().AllowAnyHeader();
        else
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

// Static files for uploaded videos - add CORS and ensure video MIME types
var uploadPath = Path.Combine(builder.Environment.ContentRootPath, "uploads", "videos");
var clipsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads", "clips");
if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);
if (!Directory.Exists(clipsPath)) Directory.CreateDirectory(clipsPath);

var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".mp4"] = "video/mp4";
provider.Mappings[".webm"] = "video/webm";
provider.Mappings[".mov"] = "video/quicktime";

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "uploads")),
    RequestPath = "/uploads",
    ContentTypeProvider = provider,
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Accept-Ranges", "bytes");
    }
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PlaybookDbContext>();
    if (usePostgres)
    {
        await db.Database.MigrateAsync();
    }
    else
    {
        db.Database.EnsureCreated();
    }
    await DbSeeder.SeedAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.MapControllers();

app.Run();
