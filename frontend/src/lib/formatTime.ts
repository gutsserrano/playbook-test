/** Format seconds as M:SS (e.g. 125 → "2:05", 65 → "1:05") */
export function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const secs = s % 60;
  return `${m}:${String(secs).padStart(2, "0")}`;
}

/** Parse M:SS or plain seconds to number (e.g. "1:30" → 90, "90" → 90) */
export function parseTime(input: string): number {
  const s = input.trim();
  if (!s) return 0;
  const parts = s.split(":");
  if (parts.length >= 2) {
    const m = Math.max(0, parseInt(parts[0]!, 10) || 0);
    const secs = Math.max(0, parseInt(parts[1]!, 10) || 0);
    return m * 60 + secs;
  }
  return Math.max(0, parseInt(s, 10) || 0);
}
