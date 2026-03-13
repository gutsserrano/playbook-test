using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Playbook.Api.Dtos;
using Playbook.Domain.Entities;
using Playbook.Infrastructure.Data;

namespace Playbook.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly PlaybookDbContext _db;

    public TeamsController(PlaybookDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetTeams()
    {
        var teams = await _db.Teams
            .OrderBy(t => t.Name)
            .Select(t => new TeamDto(t.Id, t.Name, t.CreatedAt))
            .ToListAsync();
        return Ok(teams);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TeamDto>> GetTeam(Guid id)
    {
        var team = await _db.Teams.FindAsync(id);
        if (team == null) return NotFound();
        return Ok(new TeamDto(team.Id, team.Name, team.CreatedAt));
    }

    [HttpPost]
    public async Task<ActionResult<TeamDto>> CreateTeam([FromBody] CreateTeamDto dto)
    {
        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            CreatedAt = DateTime.UtcNow
        };
        _db.Teams.Add(team);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, new TeamDto(team.Id, team.Name, team.CreatedAt));
    }
}
