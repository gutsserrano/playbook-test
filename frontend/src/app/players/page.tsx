"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { api, Player, Team, PlaysPerPlayer } from "@/lib/api";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [statsMap, setStatsMap] = useState<Record<string, PlaysPerPlayer>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.teams.list().then(setTeams);
  }, []);

  useEffect(() => {
    const teamId = selectedTeam || undefined;
    const statsParams = teamId ? { teamId } : {};
    Promise.all([
      api.players.list(teamId),
      api.analytics.playsPerPlayer(statsParams),
    ])
      .then(([p, s]) => {
        setPlayers(p);
        const map: Record<string, PlaysPerPlayer> = {};
        (s || []).forEach((stat) => {
          const pid = stat?.playerId;
          if (pid) map[String(pid).toLowerCase()] = stat;
        });
        setStatsMap(map);
      })
      .catch((err) => {
        console.error("Failed to load players/stats:", err);
        setStatsMap({});
      })
      .finally(() => setLoading(false));
  }, [selectedTeam]);

  const teamId = selectedTeam || teams[0]?.id;
  useEffect(() => {
    if (teams.length && !selectedTeam) setSelectedTeam(teams[0].id);
  }, [teams, selectedTeam]);

  const getDisplayValue = (player: Player): string | number => {
    const stat = statsMap[player.id] ?? statsMap[(player.id || "").toLowerCase()];
    return stat?.totalPlays ?? "—";
  };

  if (loading && players.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading roster...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Players</h1>
        <p className="text-slate-400 mt-1">Team roster and player profiles</p>
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

      <div className="bg-turf-800 rounded-xl border border-turf-600 overflow-hidden">
        <div className="p-6 border-b border-turf-600">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Roster
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {players.length} players
          </p>
        </div>
        <div className="divide-y divide-turf-600">
          {players.map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.id}`}
              className="flex items-center justify-between p-4 hover:bg-turf-700 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-turf-600 flex items-center justify-center font-bold text-accent">
                  {p.number}
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-accent transition-colors">
                    {p.name}
                  </p>
                  <p className="text-sm text-slate-500">{p.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-accent font-semibold tabular-nums">
                  {getDisplayValue(p)}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
