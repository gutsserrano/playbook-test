using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Playbook.Api.Dtos;
using Playbook.Domain.Entities;
using Playbook.Infrastructure.Data;

namespace Playbook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RostersController : ControllerBase
{
    private readonly PlaybookDbContext _db;

    public RostersController(PlaybookDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RosterDto>>> GetRosters([FromQuery] Guid? teamId)
    {
        var query = _db.Rosters.AsQueryable();
        if (teamId.HasValue)
            query = query.Where(r => r.TeamId == teamId.Value);

        var rosters = await query
            .OrderBy(r => r.Name)
            .Select(r => new RosterDto(r.Id, r.Name, r.TeamId, r.CreatedAt))
            .ToListAsync();
        return Ok(rosters);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RosterWithPlayersDto>> GetRoster(Guid id)
    {
        var roster = await _db.Rosters
            .Include(r => r.RosterPlayers)
            .ThenInclude(rp => rp.Player)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (roster == null) return NotFound();

        var players = roster.RosterPlayers
            .OrderBy(rp => rp.Player.Name)
            .Select(rp => new PlayerDto(rp.Player.Id, rp.Player.Name, rp.Player.Number, rp.Player.Position, rp.Player.TeamId))
            .ToList();
        return Ok(new RosterWithPlayersDto(roster.Id, roster.Name, roster.TeamId, roster.CreatedAt, players));
    }

    [HttpPost]
    public async Task<ActionResult<RosterDto>> CreateRoster([FromBody] CreateRosterDto dto)
    {
        var roster = new Roster
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            TeamId = dto.TeamId
        };
        _db.Rosters.Add(roster);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetRoster), new { id = roster.Id }, new RosterDto(roster.Id, roster.Name, roster.TeamId, roster.CreatedAt));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RosterDto>> UpdateRoster(Guid id, [FromBody] UpdateRosterDto dto)
    {
        var roster = await _db.Rosters.FindAsync(id);
        if (roster == null) return NotFound();
        roster.Name = dto.Name;
        await _db.SaveChangesAsync();
        return Ok(new RosterDto(roster.Id, roster.Name, roster.TeamId, roster.CreatedAt));
    }

    [HttpPut("{id:guid}/players")]
    public async Task<ActionResult<RosterWithPlayersDto>> SetRosterPlayers(Guid id, [FromBody] SetRosterPlayersDto dto)
    {
        var roster = await _db.Rosters
            .Include(r => r.RosterPlayers)
            .FirstOrDefaultAsync(r => r.Id == id);
        if (roster == null) return NotFound();

        roster.RosterPlayers.Clear();
        var playerIds = (dto.PlayerIds ?? Array.Empty<Guid>()).Distinct().ToList();
        if (playerIds.Count > 0)
        {
            var validPlayers = await _db.Players
                .Where(p => playerIds.Contains(p.Id) && p.TeamId == roster.TeamId)
                .Select(p => p.Id)
                .ToListAsync();
            foreach (var pid in validPlayers)
                roster.RosterPlayers.Add(new RosterPlayer { RosterId = roster.Id, PlayerId = pid });
        }
        await _db.SaveChangesAsync();

        await _db.Entry(roster)
            .Collection(r => r.RosterPlayers)
            .Query()
            .Include(rp => rp.Player)
            .LoadAsync();
        var players = roster.RosterPlayers
            .OrderBy(rp => rp.Player.Name)
            .Select(rp => new PlayerDto(rp.Player.Id, rp.Player.Name, rp.Player.Number, rp.Player.Position, rp.Player.TeamId))
            .ToList();
        return Ok(new RosterWithPlayersDto(roster.Id, roster.Name, roster.TeamId, roster.CreatedAt, players));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRoster(Guid id)
    {
        var roster = await _db.Rosters.FindAsync(id);
        if (roster == null) return NotFound();
        _db.Rosters.Remove(roster);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
