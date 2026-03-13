"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { RosterWithPlayers, Player } from "@/lib/api";
import { PLAYER_POSITIONS } from "@/lib/positions";
import { Modal } from "@/components/ui/Modal";

interface ManageRosterPlayersModalProps {
  roster: RosterWithPlayers;
  teamPlayers: Player[];
  onClose: () => void;
  onSubmit: (playerIds: string[]) => void;
}

export function ManageRosterPlayersModal({
  roster,
  teamPlayers,
  onClose,
  onSubmit,
}: ManageRosterPlayersModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [numberFilter, setNumberFilter] = useState("");

  useEffect(() => {
    setSelectedIds(new Set(roster.players.map((p) => p.id)));
  }, [roster.id]);

  const positions = PLAYER_POSITIONS;

  const filteredPlayers = useMemo(() => {
    return teamPlayers
      .filter((p) => {
        const matchSearch =
          !search.trim() ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.position.toLowerCase().includes(search.toLowerCase());
        const matchPosition = !positionFilter || p.position === positionFilter;
        const matchNumber =
          !numberFilter.trim() || (p.number != null && p.number.toString() === numberFilter.trim());
        return matchSearch && matchPosition && matchNumber;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teamPlayers, search, positionFilter, numberFilter]);

  const toggle = (playerId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(Array.from(selectedIds));
  };

  return (
    <Modal onClose={onClose} contentClassName="max-w-lg max-h-[85vh] flex flex-col">
        <h3 className="text-xl font-semibold text-white mb-1">
          Manage players: {roster.name}
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Select which team players belong to this roster. Players can be in
          multiple rosters.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search name or position..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-accent"
              />
            </div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-3 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-accent"
            >
              <option value="">All positions</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="#"
              value={numberFilter}
              onChange={(e) =>
                setNumberFilter(e.target.value.replace(/\D/g, "").slice(0, 3))
              }
              className="w-16 px-3 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="overflow-y-auto flex-1 border border-turf-600 rounded-lg divide-y divide-turf-600 max-h-64">
            {teamPlayers.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No team players. Add players first on the Players page.
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No players match your filters.
              </div>
            ) : (
              filteredPlayers.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 p-4 hover:bg-turf-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="w-5 h-5 rounded border-turf-500 bg-turf-700 text-accent focus:ring-accent"
                  />
                  <div className="w-10 h-10 rounded-full bg-turf-600 flex items-center justify-center font-bold text-accent text-sm">
                    {p.number ?? "—"}
                  </div>
                  <div>
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-sm text-slate-500">{p.position}</p>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="flex gap-3 pt-4 mt-4">
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
              Save ({selectedIds.size} players)
            </button>
          </div>
        </form>
    </Modal>
  );
}
