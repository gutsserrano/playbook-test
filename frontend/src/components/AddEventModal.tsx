"use client";

import { useState } from "react";
import { formatTime } from "@/lib/formatTime";
import { EVENT_TYPES } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";

interface AddEventModalProps {
  players: { id: string; name: string; number?: number | null }[];
  currentTime: number;
  onClose: () => void;
  onSubmit: (data: { playerId?: string; type: string; notes?: string }) => void | Promise<void>;
}

export function AddEventModal({
  players,
  currentTime,
  onClose,
  onSubmit,
}: AddEventModalProps) {
  const [playerId, setPlayerId] = useState<string>("");
  const [type, setType] = useState("Goal");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        playerId: playerId || undefined,
        type,
        notes: notes || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose}>
        <h3 className="text-xl font-semibold text-white mb-4">Add Event at {formatTime(currentTime)}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm text-slate-400 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white focus:ring-2 focus:ring-accent"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Header from cross"
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent"
            />
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
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-accent text-turf-950 font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding…" : "Add Event"}
            </button>
          </div>
        </form>
    </Modal>
  );
}
