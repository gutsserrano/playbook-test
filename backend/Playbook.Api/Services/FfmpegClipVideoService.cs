using System.Diagnostics;
using Playbook.Api.Helpers;

namespace Playbook.Api.Services;

public class FfmpegClipVideoService : IClipVideoService
{
    private readonly IWebHostEnvironment _env;

    public FfmpegClipVideoService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string?> ExtractClipAsync(string sourceVideoPath, int startSeconds, int endSeconds, Guid clipId, string clipTitle, CancellationToken ct = default)
    {
        if (!File.Exists(sourceVideoPath))
            return null;

        var duration = endSeconds - startSeconds;
        if (duration <= 0)
            return null;

        var clipsDir = Path.Combine(_env.ContentRootPath, "uploads", "clips");
        Directory.CreateDirectory(clipsDir);
        var safeName = FileHelpers.SanitizeForFileName(clipTitle) + "_" + clipId.ToString("N")[..8] + ".mp4";
        var outputPath = Path.Combine(clipsDir, safeName);

        var args = $"-y -nostdin -loglevel error -ss {startSeconds} -i \"{sourceVideoPath}\" -t {duration} -c copy -avoid_negative_ts 1 \"{outputPath}\"";

        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = "ffmpeg",
                Arguments = args,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardError = false,
                RedirectStandardOutput = false,
            }
        };
        process.Start();
        await process.WaitForExitAsync(ct);

        if (process.ExitCode == 0 && File.Exists(outputPath) && new FileInfo(outputPath).Length > 0)
            return $"/uploads/clips/{safeName}";

        return null;
    }
}
