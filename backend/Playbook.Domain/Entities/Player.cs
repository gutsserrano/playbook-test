namespace Playbook.Domain.Entities;

public class Player
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Number { get; set; }
    public string Position { get; set; } = string.Empty;
    public Guid TeamId { get; set; }

    public Team Team { get; set; } = null!;
    public ICollection<Event> Events { get; set; } = new List<Event>();
    public ICollection<Clip> Clips { get; set; } = new List<Clip>();
}
