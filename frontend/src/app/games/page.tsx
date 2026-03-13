"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Video, Calendar, ArrowRight, Plus, Search } from "lucide-react";
import { api, GameWithVideo, Team, Roster } from "@/lib/api";
import { CreateGameModal } from "@/components/CreateGameModal";
import { DateRangePicker } from "@/components/DateRangePicker";

export default function GamesPage() {
  const [games, setGames] = useState<GameWithVideo[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rosterFilter, setRosterFilter] = useState<string>("");

  const load = () => {
    return Promise.all([api.games.list(), api.teams.list(), api.rosters.list()]).then(([g, t, r]) => {
      setGames(g);
      setTeams(t);
      setRosters(r);
    });
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchSearch =
        !search.trim() ||
        game.name.toLowerCase().includes(search.toLowerCase());
      const gameDate = new Date(game.date);
      const matchDateFrom = !dateFrom || gameDate >= new Date(dateFrom);
      const matchDateTo = !dateTo || gameDate <= new Date(dateTo + "T23:59:59");
      const matchRoster =
        !rosterFilter ||
        (game.rosterId && game.rosterId === rosterFilter) ||
        (!game.rosterId && rosterFilter === "__none__");
      return matchSearch && matchDateFrom && matchDateTo && matchRoster;
    });
  }, [games, search, dateFrom, dateTo, rosterFilter]);

  const onCreateGame = async (data: { name: string; date: string; teamId: string; rosterId?: string | null }) => {
    await api.games.create({
      name: data.name,
      date: data.date,
      teamId: data.teamId,
      rosterId: data.rosterId,
    });
    load();
    setShowCreateGame(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Games</h1>
          <p className="text-slate-400 mt-1">Select a game to analyze video and mark plays</p>
        </div>
        <button
          onClick={() => setShowCreateGame(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-turf-950 font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create game
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by game name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-turf-800 border border-turf-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-accent focus:border-accent"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
            placeholder="Select date range"
          />
          <select
            value={rosterFilter}
            onChange={(e) => setRosterFilter(e.target.value)}
            className="px-4 py-2 bg-turf-800 border border-turf-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-accent focus:border-accent min-w-[140px]"
          >
            <option value="">All rosters</option>
            <option value="__none__">No roster</option>
            {rosters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-slate-500 text-sm">
        {filteredGames.length} of {games.length} games
        {(search || dateFrom || dateTo || rosterFilter) && " (filtered)"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.id}`}
            className="block bg-turf-800 rounded-xl border border-turf-600 overflow-hidden hover:border-accent/50 transition-colors group"
          >
            <div className="aspect-video bg-turf-700 flex items-center justify-center">
              <Video className="w-16 h-16 text-slate-500 group-hover:text-accent/60 transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">{game.name}</h3>
              <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
                <Calendar className="w-4 h-4" />
                {new Date(game.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              {game.videoUrl && (
                <p className="text-xs text-accent mt-2">Video ready • {game.videoDuration}s</p>
              )}
              <div className="flex items-center gap-2 mt-4 text-accent text-sm font-medium">
                Open analysis
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="bg-turf-800 rounded-xl border border-turf-600 border-dashed p-12 text-center">
          <Video className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">{games.length === 0 ? "No games yet" : "No games match your filters"}</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">
            {games.length === 0
              ? "Create a game, then open it to upload video and analyze"
              : "Try adjusting your search or filter criteria"}
          </p>
          {games.length === 0 && (
            <button
              onClick={() => setShowCreateGame(true)}
              className="px-5 py-2.5 bg-accent text-turf-950 font-semibold rounded-lg hover:bg-accent-hover"
            >
              Create your first game
            </button>
          )}
        </div>
      )}

      {showCreateGame && (
        <CreateGameModal
          teams={teams}
          onClose={() => setShowCreateGame(false)}
          onSubmit={onCreateGame}
        />
      )}
    </div>
  );
}
