using Microsoft.EntityFrameworkCore;
using Playbook.Domain.Entities;

namespace Playbook.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(PlaybookDbContext context)
    {
        if (await context.Teams.AnyAsync())
            return;

        var teamId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var team = new Team
        {
            Id = teamId,
            Name = "Eagles FC",
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };
        context.Teams.Add(team);

        var p1 = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var p2 = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        var p3 = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
        var players = new List<Player>
        {
            new() { Id = p1, Name = "Alex Johnson", Number = 7, Position = "Forward", TeamId = teamId },
            new() { Id = p2, Name = "Jordan Smith", Number = 10, Position = "Midfielder", TeamId = teamId },
            new() { Id = p3, Name = "Casey Williams", Number = 1, Position = "Goalkeeper", TeamId = teamId },
            new() { Id = Guid.NewGuid(), Name = "Taylor Brown", Number = 4, Position = "Defender", TeamId = teamId },
            new() { Id = Guid.NewGuid(), Name = "Morgan Davis", Number = 11, Position = "Forward", TeamId = teamId }
        };
        context.Players.AddRange(players);

        var gameId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        context.Games.Add(new Game
        {
            Id = gameId,
            Opponent = "Thunder United",
            Date = DateTime.UtcNow.AddDays(-14),
            TeamId = teamId
        });

        context.Games.Add(new Game
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Opponent = "Storm FC",
            Date = DateTime.UtcNow.AddDays(-7),
            TeamId = teamId
        });

        await context.SaveChangesAsync();
    }
}
