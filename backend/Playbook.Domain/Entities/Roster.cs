namespace Playbook.Domain.Entities;

public class Roster
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid TeamId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Team Team { get; set; } = null!;
    public ICollection<RosterPlayer> RosterPlayers { get; set; } = new List<RosterPlayer>();
}
