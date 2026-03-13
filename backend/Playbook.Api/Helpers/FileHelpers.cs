namespace Playbook.Api.Helpers;

public static class FileHelpers
{
    private static readonly char[] InvalidChars = Path.GetInvalidFileNameChars();

    /// <summary>
    /// Sanitizes a string for use in a filename: spaces to underscores, remove invalid chars.
    /// </summary>
    public static string SanitizeForFileName(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return "unnamed";
        var s = input.Trim();
        foreach (var c in InvalidChars)
            s = s.Replace(c, '_');
        s = s.Replace(' ', '_').Replace('\t', '_');
        while (s.Contains("__")) s = s.Replace("__", "_");
        s = s.Trim('_');
        if (string.IsNullOrEmpty(s)) return "unnamed";
        return s.Length > 100 ? s[..100] : s;
    }

    /// <summary>
    /// Gets a unique file path by appending _1, _2, etc. if the file exists.
    /// </summary>
    public static string GetUniqueFilePath(string directory, string baseFileName)
    {
        var ext = Path.GetExtension(baseFileName);
        var nameWithoutExt = Path.GetFileNameWithoutExtension(baseFileName);
        var sanitized = SanitizeForFileName(nameWithoutExt);
        var path = Path.Combine(directory, sanitized + ext);
        var i = 1;
        while (File.Exists(path))
        {
            path = Path.Combine(directory, $"{sanitized}_{i}{ext}");
            i++;
        }
        return path;
    }
}
