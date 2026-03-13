namespace Playbook.Api.Dtos;

public record ClipDto(Guid Id, Guid GameId, int StartTimestamp, int EndTimestamp, Guid? PlayerId, string Title, string? VideoUrl);
public record CreateClipDto(Guid GameId, int StartTimestamp, int EndTimestamp, Guid? PlayerId, string Title);
public record UpdateClipDto(int StartTimestamp, int EndTimestamp, Guid? PlayerId, string Title);
