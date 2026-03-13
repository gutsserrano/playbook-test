using System.ComponentModel.DataAnnotations;

namespace Playbook.Api.Dtos;

public record GameDto(Guid Id, string Name, DateTime Date, Guid TeamId, Guid? RosterId);
public record CreateGameDto(
    [Required][StringLength(200, MinimumLength = 1)] string Name,
    DateTime Date,
    Guid TeamId,
    Guid? RosterId);
public record GameWithVideoDto(Guid Id, string Name, DateTime Date, Guid TeamId, Guid? RosterId, string? VideoUrl, int? VideoDuration);
