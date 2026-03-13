"use client";

import { useState, useEffect } from "react";
import { Team } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";

interface CreateRosterModalProps {
  teams: Team[];
  onClose: () => void;
  onSubmit: (data: { name: string; teamId: string }) => void;
}

export function CreateRosterModal({
  teams,
  onClose,
  onSubmit,
}: CreateRosterModalProps) {
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");

  useEffect(() => {
    if (teams.length && !teamId) setTeamId(teams[0].id);
  }, [teams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tid = teams.length === 1 ? teams[0].id : teamId;
    if (!name.trim() || !tid) return;
    onSubmit({ name: name.trim(), teamId: tid });
  };

  if (teams.length === 0) {
    return (
      <Modal onClose={onClose}>
          <h3 className="text-xl font-semibold text-white mb-4">Create roster</h3>
          <p className="text-slate-400 mb-4">Create a team first to add rosters.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-turf-600 rounded-lg text-slate-300 hover:bg-turf-700"
          >
            Close
          </button>
    </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
        <h3 className="text-xl font-semibold text-white mb-4">
          Create roster
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {teams.length > 1 && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white focus:ring-2 focus:ring-accent"
                required
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Roster name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Varsity, JV, Game 1"
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent"
              required
              autoFocus
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
              className="flex-1 px-4 py-2 bg-accent text-turf-950 font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              Create
            </button>
          </div>
        </form>
    </Modal>
  );
}
