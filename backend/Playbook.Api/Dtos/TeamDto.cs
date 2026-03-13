namespace Playbook.Api.Dtos;

public record TeamDto(Guid Id, string Name, DateTime CreatedAt);
public record CreateTeamDto(string Name);
public record UpdateTeamDto(string Name);
