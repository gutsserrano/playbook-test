using System.ComponentModel.DataAnnotations;

namespace Playbook.Api.Dtos;

public record PlayerDto(Guid Id, string Name, int? Number, string Position, Guid TeamId);
public record CreatePlayerDto(
    [Required][StringLength(100, MinimumLength = 1)] string Name,
    [Range(0, 99)] int? Number,
    [Required][StringLength(50)] string Position,
    Guid TeamId);
public record UpdatePlayerDto(
    [Required][StringLength(100, MinimumLength = 1)] string Name,
    [Range(0, 99)] int? Number,
    [Required][StringLength(50)] string Position);
