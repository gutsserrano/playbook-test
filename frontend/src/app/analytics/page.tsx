"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users } from "lucide-react";
import { api, PlaysPerPlayer, EventDistribution } from "@/lib/api";

export default function AnalyticsPage() {
  const [playsPerPlayer, setPlaysPerPlayer] = useState<PlaysPerPlayer[]>([]);
  const [distribution, setDistribution] = useState<EventDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.analytics.playsPerPlayer(),
      api.analytics.eventDistribution(),
    ])
      .then(([p, d]) => {
        setPlaysPerPlayer(p);
        setDistribution(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalEvents = distribution.reduce((s, x) => s + x.count, 0);
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Plays per player and event distribution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-turf-800 rounded-xl border border-turf-600 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Users className="w-5 h-5" />
            Plays per Player
          </h3>
          <div className="space-y-4">
            {playsPerPlayer.map((p) => (
              <div key={p.playerId}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">
                    #{p.playerNumber} {p.playerName}
                  </span>
                  <span className="text-accent font-medium">{p.totalPlays} plays</span>
                </div>
                <div className="h-2 bg-turf-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{
                      width: `${Math.max(
                        5,
                        (p.totalPlays / Math.max(...playsPerPlayer.map((x) => x.totalPlays), 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex gap-4 mt-1 text-xs text-slate-500">
                  {p.byType?.map((b) => (
                    <span key={b.type}>
                      {b.type}: {b.count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {playsPerPlayer.length === 0 && (
              <p className="text-slate-500">No player stats yet.</p>
            )}
          </div>
        </div>

        <div className="bg-turf-800 rounded-xl border border-turf-600 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5" />
            Event Distribution
          </h3>
          <div className="space-y-4">
            {distribution.map((d) => (
              <div key={d.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{d.type}</span>
                  <span className="text-slate-400">
                    {d.count} ({totalEvents ? ((d.count / totalEvents) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="h-2 bg-turf-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {distribution.length === 0 && (
              <p className="text-slate-500">No events yet. Mark plays in game analysis.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
