export const EVENT_TYPES = [
  "Goal",
  "Assist",
  "Save",
  "Penalty",
  "Foul",
  "Corner",
  "Other",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
