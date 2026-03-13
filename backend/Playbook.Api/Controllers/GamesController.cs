using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Playbook.Api.Dtos;
using Playbook.Domain.Entities;
using Playbook.Infrastructure.Data;

namespace Playbook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly PlaybookDbContext _db;
    private readonly IWebHostEnvironment _env;

    public GamesController(PlaybookDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameWithVideoDto>>> GetGames([FromQuery] Guid? teamId)
    {
        var query = _db.Games.AsQueryable();
        if (teamId.HasValue)
            query = query.Where(g => g.TeamId == teamId.Value);

        var games = await query
            .Include(g => g.Videos)
            .OrderByDescending(g => g.Date)
            .Select(g => new GameWithVideoDto(
                g.Id,
                g.Name,
                g.Date,
                g.TeamId,
                g.RosterId,
                g.Videos.OrderByDescending(v => v.Duration).Select(v => v.VideoUrl).FirstOrDefault(),
                g.Videos.OrderByDescending(v => v.Duration).Select(v => (int?)v.Duration).FirstOrDefault()
            ))
            .ToListAsync();
        return Ok(games);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GameWithVideoDto>> GetGame(Guid id)
    {
        var game = await _db.Games
            .Include(g => g.Videos)
            .FirstOrDefaultAsync(g => g.Id == id);
        if (game == null) return NotFound();

        var video = game.Videos.OrderByDescending(v => v.Duration).FirstOrDefault();
        return Ok(new GameWithVideoDto(game.Id, game.Name, game.Date, game.TeamId, game.RosterId, video?.VideoUrl, video?.Duration));
    }

    [HttpPost]
    public async Task<ActionResult<GameDto>> CreateGame([FromBody] CreateGameDto dto)
    {
        var game = new Game
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Date = dto.Date,
            TeamId = dto.TeamId,
            RosterId = dto.RosterId
        };
        _db.Games.Add(game);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetGame), new { id = game.Id }, new GameDto(game.Id, game.Name, game.Date, game.TeamId, game.RosterId));
    }

    [HttpGet("{id:guid}/players")]
    public async Task<ActionResult<IEnumerable<PlayerDto>>> GetGamePlayers(Guid id)
    {
        var game = await _db.Games
            .Include(g => g.Roster)
            .ThenInclude(r => r!.RosterPlayers)
            .ThenInclude(rp => rp.Player)
            .FirstOrDefaultAsync(g => g.Id == id);
        if (game == null) return NotFound();

        var players = game.Roster != null
            ? game.Roster.RosterPlayers.OrderBy(rp => rp.Player.Name).Select(rp => new PlayerDto(rp.Player.Id, rp.Player.Name, rp.Player.Number, rp.Player.Position, rp.Player.TeamId)).ToList()
            : (await _db.Players.Where(p => p.TeamId == game.TeamId).OrderBy(p => p.Name).Select(p => new PlayerDto(p.Id, p.Name, p.Number, p.Position, p.TeamId)).ToListAsync());
        return Ok(players);
    }

    [HttpGet("{id:guid}/events")]
    public async Task<ActionResult<IEnumerable<EventDto>>> GetGameEvents(Guid id)
    {
        var events = await _db.Events
            .Include(e => e.Player)
            .Where(e => e.GameId == id)
            .OrderBy(e => e.Timestamp)
            .Select(e => new EventDto(e.Id, e.GameId, e.PlayerId, e.Player != null ? e.Player.Name : null, e.Timestamp, e.Type, e.Notes))
            .ToListAsync();
        return Ok(events);
    }

    [HttpPost("{id:guid}/events")]
    public async Task<ActionResult<EventDto>> CreateGameEvent(Guid id, [FromBody] CreateEventDto dto)
    {
        var game = await _db.Games.FindAsync(id);
        if (game == null) return NotFound();

        var evt = new Event
        {
            Id = Guid.NewGuid(),
            GameId = id,
            PlayerId = dto.PlayerId,
            Timestamp = dto.Timestamp,
            Type = dto.Type,
            Notes = dto.Notes
        };
        _db.Events.Add(evt);
        await _db.SaveChangesAsync();
        await _db.Entry(evt).Reference(e => e.Player).LoadAsync();
        return CreatedAtAction(nameof(GetGameEvents), new { id }, new EventDto(evt.Id, evt.GameId, evt.PlayerId, evt.Player?.Name, evt.Timestamp, evt.Type, evt.Notes));
    }

    [HttpPut("{gameId:guid}/events/{eventId:guid}")]
    public async Task<ActionResult<EventDto>> UpdateGameEvent(Guid gameId, Guid eventId, [FromBody] UpdateEventDto dto)
    {
        var evt = await _db.Events
            .Include(e => e.Player)
            .FirstOrDefaultAsync(e => e.Id == eventId && e.GameId == gameId);
        if (evt == null) return NotFound();

        evt.PlayerId = dto.PlayerId;
        evt.Timestamp = dto.Timestamp;
        evt.Type = dto.Type;
        evt.Notes = dto.Notes;
        await _db.SaveChangesAsync();
        await _db.Entry(evt).Reference(e => e.Player).LoadAsync();
        return Ok(new EventDto(evt.Id, evt.GameId, evt.PlayerId, evt.Player?.Name, evt.Timestamp, evt.Type, evt.Notes));
    }

    [HttpDelete("{gameId:guid}/events/{eventId:guid}")]
    public async Task<IActionResult> DeleteGameEvent(Guid gameId, Guid eventId)
    {
        var evt = await _db.Events.FirstOrDefaultAsync(e => e.Id == eventId && e.GameId == gameId);
        if (evt == null) return NotFound();
        _db.Events.Remove(evt);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteGame(Guid id)
    {
        var game = await _db.Games
            .Include(g => g.Videos)
            .Include(g => g.Clips)
            .Include(g => g.Events)
            .FirstOrDefaultAsync(g => g.Id == id);
        if (game == null) return NotFound();

        var root = _env.ContentRootPath;
        foreach (var clip in game.Clips)
        {
            if (!string.IsNullOrEmpty(clip.VideoUrl) && !clip.VideoUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var path = Path.Combine(root, clip.VideoUrl.TrimStart('/', '\\'));
                if (System.IO.File.Exists(path))
                    try { System.IO.File.Delete(path); } catch { /* ignore */ }
            }
        }
        foreach (var video in game.Videos)
        {
            if (!string.IsNullOrEmpty(video.VideoUrl) && !video.VideoUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                var path = Path.Combine(root, video.VideoUrl.TrimStart('/', '\\'));
                if (System.IO.File.Exists(path))
                    try { System.IO.File.Delete(path); } catch { /* ignore */ }
            }
        }

        _db.Events.RemoveRange(game.Events);
        _db.Clips.RemoveRange(game.Clips);
        _db.Videos.RemoveRange(game.Videos);
        _db.Games.Remove(game);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
