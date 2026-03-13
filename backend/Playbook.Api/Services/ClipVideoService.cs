namespace Playbook.Api.Services;

public interface IClipVideoService
{
    /// <summary>
    /// Extracts a segment from the source video and saves it as a new file.
    /// Returns the relative URL (e.g. /uploads/clips/Clip_Title_abc12345.mp4) or null if extraction fails.
    /// </summary>
    Task<string?> ExtractClipAsync(string sourceVideoPath, int startSeconds, int endSeconds, Guid clipId, string clipTitle, CancellationToken ct = default);
}
