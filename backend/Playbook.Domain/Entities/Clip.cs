namespace Playbook.Domain.Entities;

public class Clip
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public int StartTimestamp { get; set; } // Start in seconds
    public int EndTimestamp { get; set; }   // End in seconds
    public Guid? PlayerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }

    public Game Game { get; set; } = null!;
    public Player? Player { get; set; }
}
