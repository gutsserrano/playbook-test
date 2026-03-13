"use client";

import { useState } from "react";
import { formatTime } from "@/lib/formatTime";
import { Clip } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

interface EditClipModalProps {
  clip: Clip;
  players: { id: string; name: string; number?: number | null }[];
  videoDuration: number;
  onClose: () => void;
  onSubmit: (data: { startTimestamp: number; endTimestamp: number; playerId?: string; title: string }) => void;
}

export function EditClipModal({
  clip,
  players,
  videoDuration,
  onClose,
  onSubmit,
}: EditClipModalProps) {
  const [startTime, setStartTime] = useState(clip.startTimestamp);
  const [duration, setDuration] = useState(clip.endTimestamp - clip.startTimestamp);
  const [customDuration, setCustomDuration] = useState("");
  const [playerId, setPlayerId] = useState(clip.playerId || "");
  const [title, setTitle] = useState(clip.title);

  const effectiveDuration = customDuration ? Math.max(1, parseInt(customDuration, 10) || 15) : duration;
  const endTime = Math.min(videoDuration, startTime + effectiveDuration);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      startTimestamp: startTime,
      endTimestamp: endTime,
      playerId: playerId || undefined,
      title: title || "Untitled Clip",
    });
  };

  return (
    <Modal onClose={onClose}>
        <h3 className="text-xl font-semibold text-white mb-4">Edit Clip</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Start time (seconds)</label>
            <input
              type="number"
              min={0}
              max={videoDuration}
              value={startTime}
              onChange={(e) => setStartTime(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Duration</label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_OPTIONS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => {
                    setDuration(sec);
                    setCustomDuration("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    duration === sec && !customDuration
                      ? "bg-accent text-turf-950"
                      : "bg-turf-600 text-slate-300 hover:bg-turf-500"
                  }`}
                >
                  {formatTime(sec)}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-slate-500 text-sm">Custom:</span>
              <input
                type="number"
                min={1}
                max={videoDuration}
                placeholder="seconds"
                value={customDuration}
                onChange={(e) => {
                  setCustomDuration(e.target.value);
                  if (e.target.value) setDuration(0);
                }}
                className="w-20 px-2 py-1.5 bg-turf-700 border border-turf-600 rounded text-white text-sm focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <p className="text-slate-400 text-sm">
            Clip: {formatTime(startTime)} → {formatTime(endTime)}
          </p>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Johnson Header Goal"
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Player (optional)</label>
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white focus:ring-2 focus:ring-accent"
            >
              <option value="">— Select —</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.number != null ? `#${p.number} ` : ""}{p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-turf-600 rounded-lg text-slate-300 hover:bg-turf-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-accent text-turf-950 font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              Save
            </button>
          </div>
        </form>
    </Modal>
  );
}
