namespace Playbook.Domain.Entities;

public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Player> Players { get; set; } = new List<Player>();
    public ICollection<Game> Games { get; set; } = new List<Game>();
    public ICollection<Roster> Rosters { get; set; } = new List<Roster>();
}
