"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  UserPlus,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { api, Player, Team } from "@/lib/api";
import { PLAYER_POSITIONS } from "@/lib/positions";
import { AddPlayerModal } from "@/components/AddPlayerModal";
import { EditPlayerModal } from "@/components/EditPlayerModal";

const PAGE_SIZE = 50;

export default function PlayersPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [numberFilter, setNumberFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const teamId = selectedTeam || teams[0]?.id;

  useEffect(() => {
    api.teams.list().then(setTeams);
  }, []);

  useEffect(() => {
    if (teams.length && !selectedTeam) setSelectedTeam(teams[0].id);
  }, [teams, selectedTeam]);

  const load = () => {
    if (!teamId) return Promise.resolve();
    return api.players.list(teamId).then(setPlayers);
  };

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [teamId]);

  const positions = PLAYER_POSITIONS;

  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
      const matchSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.position.toLowerCase().includes(search.toLowerCase());
      const matchPosition =
        !positionFilter || p.position === positionFilter;
      const matchNumber =
        !numberFilter.trim() || (p.number != null && p.number.toString() === numberFilter.trim());
      return matchSearch && matchPosition && matchNumber;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, search, positionFilter, numberFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const paginatedPlayers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredPlayers.slice(start, start + PAGE_SIZE);
  }, [filteredPlayers, page]);

  useEffect(() => {
    setPage(1);
  }, [search, positionFilter, numberFilter]);

  const onAddPlayer = async (data: {
    name: string;
    number?: number | null;
    position: string;
  }) => {
    if (!teamId) return;
    await api.players.create({ ...data, teamId });
    load();
    setShowAddPlayer(false);
  };

  const onSavePlayer = async (data: {
    name: string;
    number?: number | null;
    position: string;
  }) => {
    if (!editingPlayer) return;
    try {
      await api.players.update(editingPlayer.id, data);
      load();
      setEditingPlayer(null);
    } catch (err) {
      console.error("Failed to update player:", err);
      alert(`Failed to update player: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const onEditPlayer = (player: Player) => {
    setEditingPlayer(player);
  };

  const onDeletePlayer = async (player: Player) => {
    if (
      !confirm(
        `Delete player "${player.name}"? This will remove them from all rosters.`
      )
    )
      return;
    await api.players.delete(player.id);
    load();
  };

  if (loading && players.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Players</h1>
        <p className="text-slate-400 mt-1">
          Manage your team players — add, edit, and organize your roster
        </p>
      </div>

      {teams.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTeam(t.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTeam === t.id
                  ? "bg-accent text-turf-950"
                  : "bg-turf-700 text-slate-300 hover:bg-turf-600"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {!teamId ? (
        <div className="bg-turf-800 rounded-xl border border-turf-600 p-8 text-center text-slate-400">
          No team available. Create a team first.
        </div>
      ) : (
        <div className="bg-turf-800 rounded-xl border border-turf-600 overflow-hidden">
          <div className="p-6 border-b border-turf-600">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 min-w-0 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name or position..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent"
                  />
                </div>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white focus:ring-2 focus:ring-accent"
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
                  placeholder="Number"
                  value={numberFilter}
                  onChange={(e) => setNumberFilter(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  className="w-24 px-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent"
                />
              </div>
              <button
                onClick={() => setShowAddPlayer(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-turf-950 font-semibold rounded-lg hover:bg-accent-hover transition-colors shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                Add player
              </button>
            </div>
            <p className="text-slate-400 text-sm mt-3">
              {filteredPlayers.length} of {players.length} players
              {(search || positionFilter || numberFilter) && " (filtered)"}
            </p>
          </div>
          <div className="divide-y divide-turf-600">
            {paginatedPlayers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                {players.length === 0
                  ? "No players yet. Add players to build your team."
                  : "No players match your filters."}
              </div>
            ) : (
              paginatedPlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 hover:bg-turf-700 transition-colors group"
                >
                  <Link
                    href={`/players/${p.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-turf-600 flex items-center justify-center font-bold text-accent shrink-0">
                      {p.number ?? "—"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white group-hover:text-accent transition-colors">
                        {p.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {p.number != null ? `#${p.number} • ` : ""}{p.position}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
                  </Link>
                  <div
                    className="flex items-center gap-1 shrink-0 ml-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <button
                      onClick={() => onEditPlayer(p)}
                      className="p-2 rounded-lg text-slate-400 hover:text-accent hover:bg-turf-600 transition-colors"
                      title="Edit player"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePlayer(p)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-turf-600 transition-colors"
                      title="Delete player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-turf-600 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg bg-turf-700 text-slate-300 hover:bg-turf-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg bg-turf-700 text-slate-300 hover:bg-turf-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddPlayer && teamId && (
        <AddPlayerModal
          teamId={teamId}
          onClose={() => setShowAddPlayer(false)}
          onSubmit={onAddPlayer}
        />
      )}

      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSubmit={onSavePlayer}
        />
      )}
    </div>
  );
}
