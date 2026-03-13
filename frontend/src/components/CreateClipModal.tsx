"use client";

import { useState } from "react";
import { formatTime, parseTime } from "@/lib/formatTime";
import { Modal } from "@/components/ui/Modal";

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

interface CreateClipModalProps {
  players: { id: string; name: string; number?: number | null }[];
  currentTime: number;
  videoDuration: number;
  onClose: () => void;
  onSubmit: (data: { startTimestamp: number; endTimestamp: number; playerId?: string; title: string }) => void | Promise<void>;
}

export function CreateClipModal({
  players,
  currentTime,
  videoDuration,
  onClose,
  onSubmit,
}: CreateClipModalProps) {
  const [startTimeDisplay, setStartTimeDisplay] = useState(() =>
    formatTime(Math.max(0, Math.floor(currentTime)))
  );
  const [duration, setDuration] = useState(15);
  const [customDuration, setCustomDuration] = useState("");
  const [playerId, setPlayerId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTime = Math.min(videoDuration, Math.max(0, parseTime(startTimeDisplay)));
  const effectiveDuration = customDuration ? Math.max(1, parseInt(customDuration, 10) || 15) : duration;
  const endTime = Math.min(videoDuration, startTime + effectiveDuration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        startTimestamp: startTime,
        endTimestamp: endTime,
        playerId: playerId || undefined,
        title: title || "Untitled Clip",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create clip");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!submitting) onClose();
  };

  return (
    <Modal onClose={handleCancel}>
        <h3 className="text-xl font-semibold text-white mb-4">Create Clip</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Start time (m:ss)</label>
            <input
              type="text"
              placeholder="0:00"
              value={startTimeDisplay}
              onChange={(e) => setStartTimeDisplay(e.target.value)}
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent font-mono"
            />
            <p className="text-xs text-slate-500 mt-0.5">e.g. 1:30 or 0:45</p>
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
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}
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
              onClick={handleCancel}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-turf-600 rounded-lg text-slate-300 hover:bg-turf-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-accent text-turf-950 font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : "Create Clip"}
            </button>
          </div>
        </form>
    </Modal>
  );
}
