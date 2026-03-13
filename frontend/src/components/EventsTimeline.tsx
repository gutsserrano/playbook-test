"use client";

import { Event, Clip } from "@/lib/api";
import { formatTime } from "@/lib/formatTime";

interface EventsTimelineProps {
  duration: number;
  events: Event[];
  clips?: Clip[];
  currentTime: number;
  selectedClipId?: string | null;
  onSeek?: (time: number) => void;
  onClipClick?: (clip: Clip) => void;
}

export function EventsTimeline({
  duration,
  events,
  clips = [],
  currentTime,
  selectedClipId,
  onSeek,
  onClipClick,
}: EventsTimelineProps) {
  const scale = 100 / Math.max(duration, 1);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const time = Math.min(duration, Math.max(0, pct * duration));
    onSeek(time);
  };

  return (
    <div className="space-y-2">
      <div
        className="relative h-10 bg-turf-700 rounded-lg overflow-hidden cursor-pointer"
        onClick={handleTrackClick}
      >
        {/* Clip segments (green bars) */}
        {clips.map((clip) => {
          const left = (clip.startTimestamp / duration) * 100;
          const width = ((clip.endTimestamp - clip.startTimestamp) / duration) * 100;
          const isSelected = selectedClipId === clip.id;
          return (
            <div
              key={clip.id}
              className={`absolute top-0 bottom-0 rounded-sm transition-colors cursor-pointer ${
                isSelected ? "bg-accent/60 ring-1 ring-accent" : "bg-accent/30 hover:bg-accent/50"
              }`}
              style={{
                left: `${left}%`,
                width: `${Math.max(width, 0.5)}%`,
                minWidth: "4px",
              }}
              title={clip.title}
              onClick={(ev) => {
                ev.stopPropagation();
                onClipClick?.(clip);
              }}
            />
          );
        })}
        {/* Event markers (dots) */}
        {events.map((e) => (
          <div
            key={e.id}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-6 -ml-1 bg-amber-500 rounded-sm z-10 cursor-pointer hover:bg-amber-400"
            style={{ left: `${e.timestamp * scale}%` }}
            title={`${e.type} at ${formatTime(e.timestamp)}${e.notes ? ` – ${e.notes}` : ""}`}
            onClick={(ev) => {
              ev.stopPropagation();
              onSeek?.(e.timestamp);
            }}
          />
        ))}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-20 pointer-events-none transition-[left] duration-75"
          style={{
            left: duration > 0
              ? `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%`
              : "0%",
          }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Events ({events.length}) · Clips ({clips.length})
      </p>
    </div>
  );
}
