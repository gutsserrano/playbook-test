using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Playbook.Infrastructure.Data;

namespace Playbook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly PlaybookDbContext _db;

    public AnalyticsController(PlaybookDbContext db) => _db = db;

    [HttpGet("plays-per-player")]
    public async Task<ActionResult<object>> GetPlaysPerPlayer([FromQuery] Guid? teamId, [FromQuery] Guid? playerId)
    {
        var query = _db.Events
            .Include(e => e.Player)
            .Where(e => e.PlayerId != null)
            .AsQueryable();

        if (teamId.HasValue)
            query = query.Where(e => e.Player!.TeamId == teamId.Value);
        if (playerId.HasValue)
            query = query.Where(e => e.PlayerId == playerId.Value);

        var events = await query.ToListAsync();

        var stats = events
            .GroupBy(e => new { e.PlayerId, e.Player!.Name, e.Player.Number })
            .Select(g => new
            {
                PlayerId = g.Key.PlayerId,
                PlayerName = g.Key.Name,
                PlayerNumber = g.Key.Number,
                TotalPlays = g.Count(),
                ByType = g.GroupBy(x => x.Type).Select(t => new { Type = t.Key, Count = t.Count() }).ToList()
            })
            .ToList();

        return Ok(stats);
    }

    [HttpGet("event-distribution")]
    public async Task<ActionResult<object>> GetEventDistribution([FromQuery] Guid? gameId, [FromQuery] Guid? teamId)
    {
        var query = _db.Events.AsQueryable();
        if (gameId.HasValue)
            query = query.Where(e => e.GameId == gameId.Value);
        if (teamId.HasValue)
            query = query
                .Include(e => e.Game)
                .Where(e => e.Game!.TeamId == teamId.Value);

        var distribution = await query
            .GroupBy(e => e.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .ToListAsync();

        return Ok(distribution);
    }
}
