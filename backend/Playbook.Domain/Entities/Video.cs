namespace Playbook.Domain.Entities;

public class Video
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string VideoUrl { get; set; } = string.Empty;
    public int Duration { get; set; } // Duration in seconds

    public Game Game { get; set; } = null!;
}
