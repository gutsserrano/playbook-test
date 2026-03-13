namespace Playbook.Api.Dtos;

public record GameDto(Guid Id, string Opponent, DateTime Date, Guid TeamId);
public record CreateGameDto(string Opponent, DateTime Date, Guid TeamId);
public record GameWithVideoDto(Guid Id, string Opponent, DateTime Date, Guid TeamId, string? VideoUrl, int? VideoDuration);
