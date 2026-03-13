using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Playbook.Api.Helpers;
using Playbook.Domain.Entities;
using Playbook.Infrastructure.Data;

namespace Playbook.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/videos")]
public class VideosController : ControllerBase
{
    private readonly PlaybookDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public VideosController(PlaybookDbContext db, IWebHostEnvironment env, IConfiguration config)
    {
        _db = db;
        _env = env;
        _config = config;
    }

    [HttpPost]
    [RequestSizeLimit(524_288_000)] // 500MB
    [RequestFormLimits(MultipartBodyLengthLimit = 524_288_000)]
    public async Task<ActionResult<VideoResponseDto>> UploadVideo(Guid gameId, [FromForm] IFormFile file, [FromForm] int duration)
    {
        var game = await _db.Games.FindAsync(gameId);
        if (game == null) return NotFound("Game not found");

        var allowed = _config.GetSection("Storage:AllowedExtensions").Get<string[]>() ?? [".mp4", ".webm", ".mov"];
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(ext) || !allowed.Contains(ext))
            return BadRequest($"Allowed formats: {string.Join(", ", allowed)}");

        var uploadDir = Path.Combine(_env.ContentRootPath, "uploads", "videos");
        if (!Directory.Exists(uploadDir))
            Directory.CreateDirectory(uploadDir);

        var videoId = Guid.NewGuid();
        var filePath = FileHelpers.GetUniqueFilePath(uploadDir, file.FileName);
        var fileName = Path.GetFileName(filePath);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var video = new Video
        {
            Id = videoId,
            GameId = gameId,
            VideoUrl = $"/uploads/videos/{fileName}",
            Duration = duration
        };
        _db.Videos.Add(video);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVideo), new { gameId, videoId }, new VideoResponseDto(
            video.Id, video.GameId, video.VideoUrl, video.Duration));
    }

    [HttpPost("youtube")]
    public async Task<ActionResult<VideoResponseDto>> LinkYoutubeVideo(Guid gameId, [FromBody] LinkYoutubeDto dto)
    {
        var game = await _db.Games.FindAsync(gameId);
        if (game == null) return NotFound("Game not found");

        var url = dto.Url?.Trim() ?? "";
        if (string.IsNullOrEmpty(url) || (!url.Contains("youtube.com") && !url.Contains("youtu.be")))
            return BadRequest("Invalid YouTube URL");

        var video = new Video
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            VideoUrl = url,
            Duration = Math.Max(1, dto.Duration)
        };
        _db.Videos.Add(video);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVideo), new { gameId, videoId = video.Id }, new VideoResponseDto(video.Id, video.GameId, video.VideoUrl, video.Duration));
    }

    [HttpGet("{videoId:guid}")]
    public async Task<ActionResult<VideoResponseDto>> GetVideo(Guid gameId, Guid videoId)
    {
        var video = await _db.Videos
            .FirstOrDefaultAsync(v => v.Id == videoId && v.GameId == gameId);
        if (video == null) return NotFound();
        return Ok(new VideoResponseDto(video.Id, video.GameId, video.VideoUrl, video.Duration));
    }
}

public record VideoResponseDto(Guid Id, Guid GameId, string VideoUrl, int Duration);
public record LinkYoutubeDto(string Url, int Duration);
