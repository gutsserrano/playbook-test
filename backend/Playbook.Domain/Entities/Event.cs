namespace Playbook.Domain.Entities;

public class Event
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid? PlayerId { get; set; }
    public int Timestamp { get; set; } // Timestamp in seconds from video start
    public string Type { get; set; } = string.Empty; // e.g., "Goal", "Assist", "Save", "Penalty"
    public string? Notes { get; set; }

    public Game Game { get; set; } = null!;
    public Player? Player { get; set; }
}
