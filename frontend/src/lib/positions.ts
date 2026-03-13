export const PLAYER_POSITIONS = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
  "Other",
] as const;

export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];

export function normalizePosition(value: string): PlayerPosition {
  const lower = value.trim().toLowerCase();
  if (!lower) return "Other";
  const match = PLAYER_POSITIONS.find((p) => p.toLowerCase() === lower);
  return match ?? "Other";
}
