"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  ClipboardList,
  User,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { api, Player, Team, Roster, RosterWithPlayers } from "@/lib/api";
import { CreateRosterModal } from "@/components/CreateRosterModal";
import { EditRosterModal } from "@/components/EditRosterModal";
import { ManageRosterPlayersModal } from "@/components/ManageRosterPlayersModal";

export default function RosterPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateRoster, setShowCreateRoster] = useState(false);
  const [editingRoster, setEditingRoster] = useState<RosterWithPlayers | null>(null);
  const [editingRosterName, setEditingRosterName] = useState<Roster | null>(null);
  const [expandedRosters, setExpandedRosters] = useState<Record<string, RosterWithPlayers>>({});

  useEffect(() => {
    api.teams.list().then(setTeams);
  }, []);

  const load = () =>
    Promise.all([api.players.list(), api.rosters.list()]).then(([p, r]) => {
      setPlayers(p);
      setRosters(r);
    });

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, []);

  const onCreateRoster = async (data: { name: string; teamId: string }) => {
    await api.rosters.create({ name: data.name, teamId: data.teamId });
    load();
    setShowCreateRoster(false);
  };

  const onSaveRosterPlayers = async (rosterId: string, playerIds: string[]) => {
    await api.rosters.setPlayers(rosterId, playerIds);
    load();
    setEditingRoster(null);
    if (expandedRosters[rosterId]) {
      const updated = await api.rosters.get(rosterId);
      setExpandedRosters((prev) => ({ ...prev, [rosterId]: updated }));
    }
  };

  const onEditRosterName = (roster: Roster) => {
    setEditingRosterName(roster);
  };

  const onSaveRosterName = async (data: { name: string }) => {
    if (!editingRosterName) return;
    await api.rosters.update(editingRosterName.id, data);
    load();
    setEditingRosterName(null);
  };

  const onEditRosterPlayers = async (roster: Roster) => {
    const full = await api.rosters.get(roster.id);
    setEditingRoster(full);
  };

  const onToggleRosterExpand = async (roster: Roster) => {
    if (expandedRosters[roster.id]) {
      setExpandedRosters((prev) => {
        const next = { ...prev };
        delete next[roster.id];
        return next;
      });
      return;
    }
    const full = await api.rosters.get(roster.id);
    setExpandedRosters((prev) => ({ ...prev, [roster.id]: full }));
  };

  const onDeleteRoster = async (roster: Roster) => {
    if (!confirm(`Delete roster "${roster.name}"?`)) return;
    await api.rosters.delete(roster.id);
    setExpandedRosters((prev) => {
      const next = { ...prev };
      delete next[roster.id];
      return next;
    });
    load();
  };

  if (loading && players.length === 0 && rosters.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading rosters...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Roster</h1>
        <p className="text-slate-400 mt-1">
          Create rosters and assign players for each game
        </p>
      </div>

      <div className="bg-turf-800 rounded-xl border border-turf-600 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-turf-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Game rosters
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Create rosters and select which players to use for each game
                </p>
              </div>
              <button
                onClick={() => setShowCreateRoster(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-turf-950 font-semibold rounded-lg hover:bg-accent-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create roster
              </button>
            </div>
            <div className="divide-y divide-turf-600">
              {rosters.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No rosters yet. Create a roster, then assign players from your team.
                </div>
              ) : (
                rosters.map((r) => (
                  <div key={r.id}>
                    <div
                      className="flex items-center justify-between p-4 hover:bg-turf-700 transition-colors group cursor-pointer"
                      onClick={() => onToggleRosterExpand(r)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {expandedRosters[r.id] ? (
                          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                        <div className="w-12 h-12 rounded-lg bg-turf-600 flex items-center justify-center shrink-0">
                          <ClipboardList className="w-6 h-6 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white">{r.name}</p>
                          <p className="text-sm text-slate-500">
                            Click to view players • Players can appear in multiple rosters
                          </p>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onEditRosterName(r)}
                          className="p-2 rounded-lg text-slate-400 hover:text-accent hover:bg-turf-600 transition-colors"
                          title="Edit roster name"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onEditRosterPlayers(r)}
                          className="p-2 rounded-lg text-slate-400 hover:text-accent hover:bg-turf-600 transition-colors"
                          title="Manage players"
                        >
                          <User className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDeleteRoster(r)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-turf-600 transition-colors"
                          title="Delete roster"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    {expandedRosters[r.id] && expandedRosters[r.id].players.length > 0 && (
                      <div className="bg-turf-900/50 border-t border-turf-600">
                        <div className="p-4 pl-14 space-y-2">
                          <p className="text-sm text-slate-400 mb-3">
                            {expandedRosters[r.id].players.length} player{expandedRosters[r.id].players.length !== 1 ? "s" : ""} in this roster
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {expandedRosters[r.id].players.map((p) => (
                              <Link
                                key={p.id}
                                href={`/players/${p.id}`}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-turf-700 hover:bg-turf-600 text-white transition-colors"
                              >
                                <span className="w-8 h-8 rounded-full bg-turf-600 flex items-center justify-center font-bold text-accent text-sm">
                                  {p.number ?? "—"}
                                </span>
                                <span className="font-medium">{p.name}</span>
                                <span className="text-slate-500 text-sm">• {p.position}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {expandedRosters[r.id] && expandedRosters[r.id].players.length === 0 && (
                      <div className="bg-turf-900/50 border-t border-turf-600 p-4 pl-14">
                        <p className="text-slate-500 text-sm">No players in this roster yet. Click the person icon to add players.</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

      {showCreateRoster && (
        <CreateRosterModal
          teams={teams}
          onClose={() => setShowCreateRoster(false)}
          onSubmit={onCreateRoster}
        />
      )}

      {editingRoster && (
        <ManageRosterPlayersModal
          roster={editingRoster}
          teamPlayers={players.filter((p) => p.teamId === editingRoster.teamId)}
          onClose={() => setEditingRoster(null)}
          onSubmit={(playerIds) => onSaveRosterPlayers(editingRoster.id, playerIds)}
        />
      )}

      {editingRosterName && (
        <EditRosterModal
          roster={editingRosterName}
          onClose={() => setEditingRosterName(null)}
          onSubmit={onSaveRosterName}
        />
      )}
    </div>
  );
}
