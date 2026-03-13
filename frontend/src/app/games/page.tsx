"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video, Calendar, ArrowRight, Plus } from "lucide-react";
import { api, GameWithVideo, Team } from "@/lib/api";
import { CreateGameModal } from "@/components/CreateGameModal";

export default function GamesPage() {
  const [games, setGames] = useState<GameWithVideo[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGame, setShowCreateGame] = useState(false);

  const load = () => {
    return Promise.all([api.games.list(), api.teams.list()]).then(([g, t]) => {
      setGames(g);
      setTeams(t);
    });
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onCreateGame = async (data: { opponent: string; date: string; teamId: string }) => {
    await api.games.create({
      opponent: data.opponent,
      date: data.date,
      teamId: data.teamId,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Games</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.id}`}
            className="block bg-turf-800 rounded-xl border border-turf-600 overflow-hidden hover:border-accent/50 transition-colors group"
          >
            <div className="aspect-video bg-turf-700 flex items-center justify-center">
              <Video className="w-16 h-16 text-slate-500 group-hover:text-accent/60 transition-colors" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white">vs {game.opponent}</h3>
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

      {games.length === 0 && (
        <div className="bg-turf-800 rounded-xl border border-turf-600 border-dashed p-12 text-center">
          <Video className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No games yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">Create a game, then open it to upload video and analyze</p>
          <button
            onClick={() => setShowCreateGame(true)}
            className="px-5 py-2.5 bg-accent text-turf-950 font-semibold rounded-lg hover:bg-accent-hover"
          >
            Create your first game
          </button>
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
