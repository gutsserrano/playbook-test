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
            .OrderBy(p => p.Number)
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

    [HttpPost]
    public async Task<ActionResult<PlayerDto>> CreatePlayer([FromBody] CreatePlayerDto dto)
    {
        var player = new Player
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Number = dto.Number,
            Position = dto.Position,
            TeamId = dto.TeamId
        };
        _db.Players.Add(player);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPlayer), new { id = player.Id }, new PlayerDto(player.Id, player.Name, player.Number, player.Position, player.TeamId));
    }
}
