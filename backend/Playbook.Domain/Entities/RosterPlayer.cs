namespace Playbook.Domain.Entities;

public class RosterPlayer
{
    public Guid RosterId { get; set; }
    public Guid PlayerId { get; set; }

    public Roster Roster { get; set; } = null!;
    public Player Player { get; set; } = null!;
}
