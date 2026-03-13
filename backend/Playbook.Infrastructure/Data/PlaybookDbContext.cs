using Microsoft.EntityFrameworkCore;
using Playbook.Domain.Entities;

namespace Playbook.Infrastructure.Data;

public class PlaybookDbContext : DbContext
{
    public PlaybookDbContext(DbContextOptions<PlaybookDbContext> options) : base(options) { }

    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Player> Players => Set<Player>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Clip> Clips => Set<Clip>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Team>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200);
        });

        modelBuilder.Entity<Player>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.Position).HasMaxLength(50);
            e.HasOne(x => x.Team).WithMany(t => t.Players).HasForeignKey(x => x.TeamId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Game>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Opponent).HasMaxLength(200);
            e.HasOne(x => x.Team).WithMany(t => t.Games).HasForeignKey(x => x.TeamId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Video>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Game).WithMany(g => g.Videos).HasForeignKey(x => x.GameId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Event>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Type).HasMaxLength(100);
            e.HasOne(x => x.Game).WithMany(g => g.Events).HasForeignKey(x => x.GameId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Player).WithMany(p => p.Events).HasForeignKey(x => x.PlayerId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Clip>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(500);
            e.HasOne(x => x.Game).WithMany(g => g.Clips).HasForeignKey(x => x.GameId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Player).WithMany(p => p.Clips).HasForeignKey(x => x.PlayerId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
