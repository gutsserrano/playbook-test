"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video, TrendingUp, Film, ArrowRight } from "lucide-react";
import { api, GameWithVideo, EventDistribution } from "@/lib/api";

export default function Dashboard() {
  const [games, setGames] = useState<GameWithVideo[]>([]);
  const [distribution, setDistribution] = useState<EventDistribution[]>([]);
  const [clipCount, setClipCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.games.list(),
      api.analytics.eventDistribution(),
      api.clips.list(),
    ])
      .then(([g, d, c]) => {
        setGames(g.slice(0, 5));
        setDistribution(d);
        setClipCount(c.length);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalEvents = distribution.reduce((s, x) => s + x.count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your team&apos;s video analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-turf-800 rounded-xl p-6 border border-turf-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Games</p>
              <p className="text-3xl font-bold text-white mt-1">{games.length}</p>
            </div>
            <Video className="w-12 h-12 text-accent/60" />
          </div>
        </div>
        <div className="bg-turf-800 rounded-xl p-6 border border-turf-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Events Marked</p>
              <p className="text-3xl font-bold text-white mt-1">{totalEvents}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-accent/60" />
          </div>
        </div>
        <div className="bg-turf-800 rounded-xl p-6 border border-turf-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Clips Created</p>
              <p className="text-3xl font-bold text-white mt-1">{clipCount}</p>
            </div>
            <Film className="w-12 h-12 text-accent/60" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-turf-800 rounded-xl border border-turf-600 overflow-hidden">
          <div className="p-6 border-b border-turf-600">
            <h2 className="text-lg font-semibold text-white">Recent Games</h2>
            <p className="text-slate-400 text-sm">Your latest game recordings</p>
          </div>
          <div className="divide-y divide-turf-600">
            {games.map((g) => (
              <Link
                key={g.id}
                href={`/games/${g.id}`}
                className="flex items-center justify-between p-4 hover:bg-turf-700 transition-colors"
              >
                <div>
                  <p className="font-medium text-white">vs {g.opponent}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(g.date).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500" />
              </Link>
            ))}
          </div>
          <div className="p-4 border-t border-turf-600">
            <Link
              href="/games"
              className="text-accent hover:text-accent-hover text-sm font-medium"
            >
              View all games →
            </Link>
          </div>
        </div>

        <div className="bg-turf-800 rounded-xl border border-turf-600 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Event Distribution</h2>
          <div className="space-y-4">
            {distribution.slice(0, 5).map((d) => (
              <div key={d.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{d.type}</span>
                  <span className="text-slate-500">{d.count}</span>
                </div>
                <div className="h-2 bg-turf-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{
                      width: `${totalEvents ? (d.count / totalEvents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-turf-800 rounded-xl border border-turf-600 p-8 text-center">
        <Video className="w-16 h-16 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Upload a new game</h3>
        <p className="text-slate-400 mb-4 max-w-md mx-auto">
          Add a new game video to start marking plays, creating clips, and building
          highlight reels.
        </p>
        <button
          onClick={() => (window.location.href = "/games")}
          className="px-6 py-3 bg-accent text-turf-950 font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          Go to Games
        </button>
      </div>
    </div>
  );
}
