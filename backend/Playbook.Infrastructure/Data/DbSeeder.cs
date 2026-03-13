using Microsoft.EntityFrameworkCore;
using Playbook.Domain.Entities;

namespace Playbook.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(PlaybookDbContext context)
    {
        if (await context.Teams.AnyAsync())
            return;

        context.Teams.Add(new Team
        {
            Id = Guid.NewGuid(),
            Name = "My Team",
            CreatedAt = DateTime.UtcNow,
        });
        await context.SaveChangesAsync();
    }
}
