using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Playbook.Api.Dtos;
using Playbook.Api.Services;
using Playbook.Domain.Entities;
using Playbook.Infrastructure.Data;

namespace Playbook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClipsController : ControllerBase
{
    private readonly PlaybookDbContext _db;
    private readonly IClipVideoService _clipVideoService;
    private readonly IWebHostEnvironment _env;
    private readonly IServiceScopeFactory _scopeFactory;

    public ClipsController(PlaybookDbContext db, IClipVideoService clipVideoService, IWebHostEnvironment env, IServiceScopeFactory scopeFactory)
    {
        _db = db;
        _clipVideoService = clipVideoService;
        _env = env;
        _scopeFactory = scopeFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClipDto>>> GetClips([FromQuery] Guid? gameId, [FromQuery] Guid? playerId)
    {
        var query = _db.Clips.Include(c => c.Game).AsQueryable();
        if (gameId.HasValue)
            query = query.Where(c => c.GameId == gameId.Value);
        if (playerId.HasValue)
            query = query.Where(c => c.PlayerId == playerId.Value);

        var clips = await query
            .OrderByDescending(c => c.StartTimestamp)
            .Select(c => new ClipDto(c.Id, c.GameId, c.StartTimestamp, c.EndTimestamp, c.PlayerId, c.Title, c.VideoUrl))
            .ToListAsync();
        return Ok(clips);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClipDto>> GetClip(Guid id)
    {
        var clip = await _db.Clips.FindAsync(id);
        if (clip == null) return NotFound();
        return Ok(new ClipDto(clip.Id, clip.GameId, clip.StartTimestamp, clip.EndTimestamp, clip.PlayerId, clip.Title ?? "Untitled Clip", clip.VideoUrl));
    }

    [HttpPost]
    public async Task<ActionResult<ClipDto>> CreateClip([FromBody] CreateClipDto dto)
    {
        var game = await _db.Games.Include(g => g.Videos).FirstOrDefaultAsync(g => g.Id == dto.GameId);
        if (game == null) return NotFound("Game not found");

        var clip = new Clip
        {
            Id = Guid.NewGuid(),
            GameId = dto.GameId,
            StartTimestamp = dto.StartTimestamp,
            EndTimestamp = dto.EndTimestamp,
            PlayerId = dto.PlayerId,
            Title = dto.Title
        };
        _db.Clips.Add(clip);
        await _db.SaveChangesAsync();

        var clipId = clip.Id;
        var gameId = dto.GameId;
        var startTs = dto.StartTimestamp;
        var endTs = dto.EndTimestamp;

        var sourceVideo = game.Videos.OrderByDescending(v => v.Duration).FirstOrDefault();
        if (sourceVideo != null && !sourceVideo.VideoUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            var sourcePath = Path.GetFullPath(Path.Combine(_env.ContentRootPath, sourceVideo.VideoUrl.TrimStart('/', '\\')));
            if (System.IO.File.Exists(sourcePath))
            {
                _ = Task.Run(async () =>
                {
                    await Task.Delay(500);
                    try
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<PlaybookDbContext>();
                        var svc = scope.ServiceProvider.GetRequiredService<IClipVideoService>();
                        var videoUrl = await svc.ExtractClipAsync(sourcePath, startTs, endTs, clipId, dto.Title ?? "Untitled Clip");
                        if (videoUrl != null)
                        {
                            var c = await db.Clips.FindAsync(clipId);
                            if (c != null) { c.VideoUrl = videoUrl; await db.SaveChangesAsync(); }
                        }
                    }
                    catch { /* log in production */ }
                });
            }
        }

        return CreatedAtAction(nameof(GetClip), new { id = clip.Id }, new ClipDto(clip.Id, clip.GameId, clip.StartTimestamp, clip.EndTimestamp, clip.PlayerId, clip.Title ?? "Untitled Clip", clip.VideoUrl));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ClipDto>> UpdateClip(Guid id, [FromBody] UpdateClipDto dto)
    {
        var clip = await _db.Clips.Include(c => c.Game).ThenInclude(g => g!.Videos).FirstOrDefaultAsync(c => c.Id == id);
        if (clip == null) return NotFound();
        var timestampsChanged = clip.StartTimestamp != dto.StartTimestamp || clip.EndTimestamp != dto.EndTimestamp;
        clip.StartTimestamp = dto.StartTimestamp;
        clip.EndTimestamp = dto.EndTimestamp;
        clip.PlayerId = dto.PlayerId;
        clip.Title = dto.Title;

        if (timestampsChanged && clip.Game != null)
        {
            var sourceVideo = clip.Game.Videos.OrderByDescending(v => v.Duration).FirstOrDefault();
            if (sourceVideo != null && !sourceVideo.VideoUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var sourcePath = Path.Combine(_env.ContentRootPath, sourceVideo.VideoUrl.TrimStart('/'));
                if (System.IO.File.Exists(sourcePath))
                {
                    var oldPath = clip.VideoUrl != null ? Path.Combine(_env.ContentRootPath, clip.VideoUrl.TrimStart('/')) : null;
                    var videoUrl = await _clipVideoService.ExtractClipAsync(sourcePath, dto.StartTimestamp, dto.EndTimestamp, clip.Id, clip.Title ?? "Untitled Clip");
                    if (videoUrl != null)
                    {
                        clip.VideoUrl = videoUrl;
                        if (oldPath != null && System.IO.File.Exists(oldPath))
                            try { System.IO.File.Delete(oldPath); } catch { /* ignore */ }
                    }
                }
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new ClipDto(clip.Id, clip.GameId, clip.StartTimestamp, clip.EndTimestamp, clip.PlayerId, clip.Title ?? "Untitled Clip", clip.VideoUrl));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteClip(Guid id)
    {
        var clip = await _db.Clips.FindAsync(id);
        if (clip == null) return NotFound();
        if (clip.VideoUrl != null)
        {
            var path = Path.Combine(_env.ContentRootPath, clip.VideoUrl.TrimStart('/'));
            if (System.IO.File.Exists(path))
                try { System.IO.File.Delete(path); } catch { /* ignore */ }
        }
        _db.Clips.Remove(clip);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
