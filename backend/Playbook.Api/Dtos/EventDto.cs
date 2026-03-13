namespace Playbook.Api.Dtos;

public record EventDto(Guid Id, Guid GameId, Guid? PlayerId, string? PlayerName, int Timestamp, string Type, string? Notes);
public record CreateEventDto(Guid? PlayerId, int Timestamp, string Type, string? Notes);
public record UpdateEventDto(Guid? PlayerId, int Timestamp, string Type, string? Notes);
