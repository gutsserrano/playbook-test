using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Playbook.Api.Dtos;
using Playbook.Domain.Entities;
using Playbook.Infrastructure.Data;

namespace Playbook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly PlaybookDbContext _db;

    public PlayersController(PlaybookDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlayerDto>>> GetPlayers([FromQuery] Guid? teamId)
    {
        var query = _db.Players.AsQueryable();
        if (teamId.HasValue)
            query = query.Where(p => p.TeamId == teamId.Value);

        var players = await query
            .OrderBy(p => p.Name)
            .Select(p => new PlayerDto(p.Id, p.Name, p.Number, p.Position, p.TeamId))
            .ToListAsync();
        return Ok(players);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PlayerDto>> GetPlayer(Guid id)
    {
        var player = await _db.Players.FindAsync(id);
        if (player == null) return NotFound();
        return Ok(new PlayerDto(player.Id, player.Name, player.Number, player.Position, player.TeamId));
    }

    private static readonly HashSet<string> AllowedPositions = new(StringComparer.OrdinalIgnoreCase)
        { "Goalkeeper", "Defender", "Midfielder", "Forward", "Other" };

    private static string NormalizePosition(string? position)
    {
        if (string.IsNullOrWhiteSpace(position)) return "Other";
        return AllowedPositions.Contains(position.Trim()) ? position.Trim() : "Other";
    }

    [HttpPost]
    public async Task<ActionResult<PlayerDto>> CreatePlayer([FromBody] CreatePlayerDto dto)
    {
        var player = new Player
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Number = dto.Number is >= 0 and <= 99 ? dto.Number : null,
            Position = NormalizePosition(dto.Position),
            TeamId = dto.TeamId
        };
        _db.Players.Add(player);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPlayer), new { id = player.Id }, new PlayerDto(player.Id, player.Name, player.Number, player.Position, player.TeamId));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PlayerDto>> UpdatePlayer([FromRoute] Guid id, [FromBody] UpdatePlayerDto? dto)
    {
        if (dto == null) return BadRequest("Request body is required");
        var player = await _db.Players.FindAsync(id);
        if (player == null) return NotFound();
        player.Name = dto.Name;
        player.Number = dto.Number is >= 0 and <= 99 ? dto.Number : null;
        player.Position = NormalizePosition(dto.Position);
        await _db.SaveChangesAsync();
        return Ok(new PlayerDto(player.Id, player.Name, player.Number, player.Position, player.TeamId));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePlayer(Guid id)
    {
        var player = await _db.Players.FindAsync(id);
        if (player == null) return NotFound();
        _db.Players.Remove(player);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
