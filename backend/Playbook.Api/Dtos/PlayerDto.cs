namespace Playbook.Api.Dtos;

public record PlayerDto(Guid Id, string Name, int Number, string Position, Guid TeamId);
public record CreatePlayerDto(string Name, int Number, string Position, Guid TeamId);
public record UpdatePlayerDto(string Name, int Number, string Position);
