namespace Playbook.Api.Dtos;

public record RosterDto(Guid Id, string Name, Guid TeamId, DateTime CreatedAt);
public record CreateRosterDto(string Name, Guid TeamId);
public record UpdateRosterDto(string Name);
public record RosterWithPlayersDto(Guid Id, string Name, Guid TeamId, DateTime CreatedAt, IReadOnlyList<PlayerDto> Players);
public record SetRosterPlayersDto(IReadOnlyList<Guid> PlayerIds);
