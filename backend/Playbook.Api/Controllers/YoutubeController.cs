using Microsoft.AspNetCore.Mvc;

namespace Playbook.Api.Controllers;

[ApiController]
[Route("api/youtube")]
public class YoutubeController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public YoutubeController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Fetches video duration in seconds from YouTube.
    /// Accepts full URL (youtube.com/watch?v=... or youtu.be/...) or video ID.
    /// </summary>
    [HttpGet("duration")]
    public async Task<ActionResult<YoutubeDurationDto>> GetDuration([FromQuery] string url)
    {
        var videoId = ExtractVideoId(url?.Trim() ?? "");
        if (string.IsNullOrEmpty(videoId))
            return BadRequest("Invalid YouTube URL or video ID");

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.UserAgent.ParseAdd(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            var pageUrl = $"https://www.youtube.com/watch?v={videoId}";
            var html = await client.GetStringAsync(pageUrl);

            // ytInitialPlayerResponse contains videoDetails.lengthSeconds
            var match = System.Text.RegularExpressions.Regex.Match(
                html,
                @"""lengthSeconds""\s*:\s*""?(\d+)""?",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (!match.Success)
                return NotFound("Could not extract duration from YouTube page");

            var seconds = int.Parse(match.Groups[1].Value);
            if (seconds < 1)
                return BadRequest("Invalid duration");

            return Ok(new YoutubeDurationDto(seconds));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    private static string ExtractVideoId(string url)
    {
        if (string.IsNullOrEmpty(url)) return "";
        if (url.Contains("youtu.be/"))
        {
            var part = url.Split("youtu.be/")[1];
            return part?.Split('?')[0].Trim('/') ?? "";
        }
        var m = System.Text.RegularExpressions.Regex.Match(url, @"[?&]v=([^&]+)");
        return m.Success ? m.Groups[1].Value : url;
    }
}

public record YoutubeDurationDto(int Duration);
