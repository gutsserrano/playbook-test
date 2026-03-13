"use client";

import { useState, useEffect } from "react";
import { Team, Roster } from "@/lib/api";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";

interface CreateGameModalProps {
  teams: Team[];
  onClose: () => void;
  onSubmit: (data: { name: string; date: string; teamId: string; rosterId?: string | null }) => void;
}

export function CreateGameModal({ teams, onClose, onSubmit }: CreateGameModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [teamId, setTeamId] = useState("");
  const [rosterId, setRosterId] = useState<string | null>(null);
  const [rosters, setRosters] = useState<Roster[]>([]);

  useEffect(() => {
    if (teams.length > 0 && !teamId) setTeamId(teams[0].id);
  }, [teams, teamId]);

  useEffect(() => {
    if (!teamId) {
      setRosters([]);
      setRosterId(null);
      return;
    }
    api.rosters.list(teamId).then((r) => {
      setRosters(r);
      setRosterId(r.length > 0 ? r[0].id : null);
    });
  }, [teamId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const chosenTeamId = teamId || teams[0]?.id;
    if (!chosenTeamId) {
      alert("No team available. Create a team first from the Roster page.");
      return;
    }
    onSubmit({
      name: name.trim(),
      date: new Date(date).toISOString(),
      teamId: chosenTeamId,
      rosterId: rosterId || null,
    });
  };

  return (
    <Modal onClose={onClose}>
        <h3 className="text-xl font-semibold text-white mb-4">Create game</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. vs Thunder United, Training, Practice, Highlights"
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
          <div>
            <label className="block text-sm text-slate-400 mb-1">Roster</label>
            <select
              value={rosterId ?? ""}
              onChange={(e) => setRosterId(e.target.value || null)}
              className="w-full px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white focus:ring-2 focus:ring-accent"
            >
              <option value="">— No roster (use all team players) —</option>
              {rosters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Select which roster of players to use for this game
            </p>
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
