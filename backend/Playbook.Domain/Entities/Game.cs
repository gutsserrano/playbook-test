namespace Playbook.Domain.Entities;

public class Game
{
    public Guid Id { get; set; }
    public string Opponent { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public Guid TeamId { get; set; }

    public Team Team { get; set; } = null!;
    public ICollection<Video> Videos { get; set; } = new List<Video>();
    public ICollection<Event> Events { get; set; } = new List<Event>();
    public ICollection<Clip> Clips { get; set; } = new List<Clip>();
}
