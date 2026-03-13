"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Film, BarChart3, Pencil, Trash2 } from "lucide-react";
import { api, Clip, Player, PlaysPerPlayer } from "@/lib/api";
import { EditPlayerModal } from "@/components/EditPlayerModal";
import { formatTime } from "@/lib/formatTime";

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [showEditPlayer, setShowEditPlayer] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [stats, setStats] = useState<PlaysPerPlayer | null>(null);
  const [statsStatFilter, setStatsStatFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.players.get(id),
      api.clips.list({ playerId: id }),
      api.analytics.playsPerPlayer({ playerId: id }),
    ])
      .then(([p, c, s]) => {
        setPlayer(p);
        setClips(c);
        setStats(s[0] || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !player) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading player...</div>
      </div>
    );
  }

  const onSavePlayer = async (data: { name: string; number?: number | null; position: string }) => {
    if (!player) return;
    try {
      const updated = await api.players.update(player.id, data);
      setPlayer(updated);
      setShowEditPlayer(false);
    } catch (err) {
      console.error("Failed to update player:", err);
      alert(`Failed to update player: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const onDeletePlayer = async () => {
    if (!player) return;
    if (!confirm(`Delete player "${player.name}"? This will remove them from all rosters.`)) return;
    await api.players.delete(player.id);
    router.push("/players");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/players"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Players
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditPlayer(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-turf-700 hover:text-white transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDeletePlayer}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-turf-600 flex items-center justify-center text-3xl font-bold text-accent">
          {player.number ?? "—"}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{player.name}</h1>
          <p className="text-slate-400 mt-1">
            {player.number != null ? `#${player.number} • ` : ""}{player.position}
          </p>
        </div>
      </div>

      {showEditPlayer && player && (
        <EditPlayerModal
          player={player}
          onClose={() => setShowEditPlayer(false)}
          onSubmit={onSavePlayer}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-turf-800 rounded-xl border border-turf-600 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" />
            Stats
          </h3>
          {stats && (stats.totalPlays > 0 || (stats.byType?.length ?? 0) > 0) ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-slate-400 text-sm">View:</label>
                <select
                  value={statsStatFilter}
                  onChange={(e) => setStatsStatFilter(e.target.value)}
                  className="px-3 py-1.5 bg-turf-700 border border-turf-600 rounded text-white text-sm focus:ring-2 focus:ring-accent"
                >
                  <option value="all">All stats</option>
                  {stats.byType?.map((b) => (
                    <option key={b.type} value={b.type}>
                      {b.type}
                    </option>
                  ))}
                </select>
              </div>
              {statsStatFilter === "all" ? (
                <>
                  <p className="text-slate-300">
                    Total plays: <span className="text-accent font-semibold">{stats.totalPlays}</span>
                  </p>
                  <div className="space-y-2">
                    {stats.byType?.map((b) => (
                      <div key={b.type} className="flex justify-between text-sm">
                        <span className="text-slate-400">{b.type}</span>
                        <span className="text-white font-medium">{b.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-slate-300">
                  {statsStatFilter}:{" "}
                  <span className="text-accent font-semibold">
                    {stats.byType?.find((b) => b.type === statsStatFilter)?.count ?? 0}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-slate-500">No stats yet. Add events in game analysis and associate them with this player.</p>
          )}
        </div>

        <div className="bg-turf-800 rounded-xl border border-turf-600 p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Film className="w-5 h-5" />
            Clips
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {clips.map((c) => (
              <Link
                key={c.id}
                href={`/highlights?clip=${c.id}`}
                className="block py-2 px-3 rounded-lg bg-turf-700 hover:bg-turf-600 transition-colors"
              >
                <p className="font-medium text-white">{c.title}</p>
                <p className="text-xs text-slate-500">
                  {formatTime(c.startTimestamp)} – {formatTime(c.endTimestamp)}
                </p>
              </Link>
            ))}
            {clips.length === 0 && (
              <p className="text-slate-500 text-sm">No clips associated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
