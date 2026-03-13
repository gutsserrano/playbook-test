"use client";

import { useState, useEffect } from "react";
import { Team } from "@/lib/api";

interface CreateGameModalProps {
  teams: Team[];
  onClose: () => void;
  onSubmit: (data: { opponent: string; date: string; teamId: string }) => void;
}

export function CreateGameModal({ teams, onClose, onSubmit }: CreateGameModalProps) {
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [teamId, setTeamId] = useState("");

  useEffect(() => {
    if (teams.length > 0 && !teamId) setTeamId(teams[0].id);
  }, [teams, teamId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent.trim()) return;
    const chosenTeamId = teamId || teams[0]?.id;
    if (!chosenTeamId) {
      alert("No team available. Create a team first from the Teams page.");
      return;
    }
    onSubmit({
      opponent: opponent.trim(),
      date: new Date(date).toISOString(),
      teamId: chosenTeamId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-turf-800 rounded-xl border border-turf-600 w-full max-w-md p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Create game</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Opponent</label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="e.g. Thunder United"
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Date & time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white focus:ring-2 focus:ring-accent"
            />
          </div>
          {teams.length > 1 ? (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white focus:ring-2 focus:ring-accent"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
