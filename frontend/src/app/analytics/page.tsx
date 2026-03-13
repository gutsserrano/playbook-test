"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  Target,
  Users,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info,
  Award,
  Crosshair,
  Shield,
} from "lucide-react";
import { api, PlaysPerPlayer, EventDistribution, PlaysPerRoster, GameWithVideo } from "@/lib/api";

const CHART_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

const POSITIVE_EVENTS = new Set(["Goal", "Assist", "Save", "Interception", "Pass"]);
const DEFENSIVE_EVENTS = new Set(["Save", "Tackle", "Interception"]);

function KpiCard({
  icon: Icon,
  label,
  value,
  subtext,
  tooltip,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  tooltip?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 transition-colors ${
        accent
          ? "bg-accent/10 border-accent/30"
          : "bg-turf-800/50 border-turf-600/50 hover:border-turf-500/50"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              accent ? "bg-accent/20" : "bg-turf-700/80"
            }`}
          >
            <Icon className={`w-5 h-5 ${accent ? "text-accent" : "text-slate-400"}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-slate-400" title={tooltip}>
                {label}
              </span>
              {tooltip && (
                <span className="text-slate-500 cursor-help" title={tooltip}>
                  <Info className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
            <p className={`text-2xl font-bold mt-0.5 ${accent ? "text-accent" : "text-white"}`}>
              {value}
            </p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  value,
  description,
  variant = "default",
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description?: string;
  variant?: "default" | "positive" | "neutral";
}) {
  const variants = {
    default: "border-turf-600/50 bg-turf-800/30",
    positive: "border-accent/20 bg-accent/5",
    neutral: "border-amber-500/20 bg-amber-500/5",
  };
  const iconColors = {
    default: "text-slate-400",
    positive: "text-accent",
    neutral: "text-amber-400",
  };
  return (
    <div
      className={`rounded-xl border p-5 ${variants[variant]} transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-turf-700/50 ${iconColors[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-lg font-bold text-white mt-1 truncate">{value}</p>
          {description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player, rank }: { player: PlaysPerPlayer; rank: number }) {
  const topType = player.byType?.[0];
  const efficiency = player.byType?.length || 0;
  return (
    <div className="rounded-xl border border-turf-600/50 bg-turf-800/30 p-4 hover:border-turf-500/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-turf-700 text-sm font-bold text-accent">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate">
            {player.playerNumber != null ? `#${player.playerNumber} ` : ""}
            {player.playerName}
          </p>
          <p className="text-sm text-slate-400">
            {player.totalPlays} plays
            {topType ? ` · Top: ${topType.type}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-accent">{player.totalPlays}</p>
          <p className="text-xs text-slate-500">events</p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [playsPerPlayer, setPlaysPerPlayer] = useState<PlaysPerPlayer[]>([]);
  const [playsPerRoster, setPlaysPerRoster] = useState<PlaysPerRoster[]>([]);
  const [distribution, setDistribution] = useState<EventDistribution[]>([]);
  const [games, setGames] = useState<GameWithVideo[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const params = selectedGameId ? { gameId: selectedGameId } : undefined;

  useEffect(() => {
    api.games.list().then(setGames);
  }, []);

  useEffect(() => {
    Promise.all([
      api.analytics.playsPerPlayer(params),
      api.analytics.playsPerRoster(params),
      api.analytics.eventDistribution(params),
    ])
      .then(([p, r, d]) => {
        setPlaysPerPlayer([...p].sort((a, b) => b.totalPlays - a.totalPlays));
        setPlaysPerRoster(r);
        setDistribution(d);
      })
      .finally(() => setLoading(false));
  }, [selectedGameId]);

  const totalEvents = distribution.reduce((s, x) => s + x.count, 0);
  const goals = distribution.find((d) => d.type === "Goal")?.count ?? 0;
  const assists = distribution.find((d) => d.type === "Assist")?.count ?? 0;
  const topEvent = distribution[0];
  const topPlayer = playsPerPlayer[0];
  const topRoster = playsPerRoster[0];

  const chartRosterData = playsPerRoster.slice(0, 5).map((r) => ({
    name: r.rosterName.length > 12 ? r.rosterName.slice(0, 12) + "…" : r.rosterName,
    fullName: r.rosterName,
    plays: r.totalPlays,
  }));

  const pieData = distribution.slice(0, 6).map((d) => ({
    name: d.type,
    value: d.count,
  }));

  const topPlayers = playsPerPlayer.slice(0, 6);

  const insights = [
    topPlayer && {
      icon: Award,
      title: "Most Active Player",
      value: `${topPlayer.playerNumber != null ? `#${topPlayer.playerNumber} ` : ""}${topPlayer.playerName}`,
      description: `${topPlayer.totalPlays} recorded events`,
      variant: "positive" as const,
    },
    topEvent && {
      icon: Crosshair,
      title: "Dominant Event Type",
      value: topEvent.type,
      description: `${topEvent.count} occurrences (${totalEvents ? ((topEvent.count / totalEvents) * 100).toFixed(0) : 0}% of all events)`,
      variant: "default" as const,
    },
    topRoster && playsPerRoster.length > 1 && {
      icon: Shield,
      title: "Most Involved Roster",
      value: topRoster.rosterName,
      description: `${topRoster.totalPlays} plays recorded`,
      variant: "neutral" as const,
    },
  ].filter(Boolean) as Array<{
    icon: React.ElementType;
    title: string;
    value: string;
    description?: string;
    variant: "default" | "positive" | "neutral";
  }>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-accent/30" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Match Analytics
          </h1>
          <p className="text-slate-400 mt-1">
            Performance insights at a glance
          </p>
        </div>
        <div>
          <label className="text-sm text-slate-500 block mb-1.5">Filter by game</label>
          <select
            value={selectedGameId ?? ""}
            onChange={(e) => setSelectedGameId(e.target.value || null)}
            className="px-4 py-2.5 rounded-xl bg-turf-800 border border-turf-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          >
            <option value="">All games</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Match Overview – KPI Cards */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Activity}
            label="Total events"
            value={totalEvents}
            tooltip="All recorded plays (goals, assists, tackles, etc.)"
          />
          <KpiCard
            icon={Target}
            label="Goals"
            value={goals}
            subtext={assists > 0 ? `${assists} assists` : undefined}
            tooltip="Goals scored in selected scope"
            accent={goals > 0}
          />
          <KpiCard
            icon={Crosshair}
            label="Top event"
            value={topEvent?.type ?? "—"}
            subtext={topEvent ? `${topEvent.count} recorded` : undefined}
            tooltip="Most frequent event type"
          />
          <KpiCard
            icon={Users}
            label="Players involved"
            value={playsPerPlayer.length}
            tooltip="Players with at least one recorded event"
          />
        </div>
      </section>

      {/* 2. Key Insights */}
      {insights.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Key insights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
              <InsightCard key={i} {...insight} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Team Performance – Charts */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Team performance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-turf-600/50 bg-turf-800/30 p-6">
            <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Event distribution
            </h3>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#141d18",
                        border: "1px solid #243028",
                        borderRadius: "12px",
                      }}
                      formatter={(value, name) => [
                        `${Number(value ?? 0)} (${totalEvents ? ((Number(value ?? 0) / totalEvents) * 100).toFixed(0) : 0}%)`,
                        String(name ?? ""),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-500 text-sm py-12 text-center">
                No events yet. Mark plays in game analysis.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-turf-600/50 bg-turf-800/30 p-6">
            <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent" />
              Plays by roster
            </h3>
            {chartRosterData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartRosterData}
                    layout="vertical"
                    margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#243028" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={12}
                      width={90}
                      tick={{ fill: "#94a3b8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#141d18",
                        border: "1px solid #243028",
                        borderRadius: "12px",
                      }}
                      formatter={(value, _, props: { payload?: { fullName?: string } }) => [
                        `${Number(value ?? 0)} plays`,
                        props?.payload?.fullName ?? "",
                      ]}
                    />
                    <Bar dataKey="plays" fill="#22c55e" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-500 text-sm py-12 text-center">
                No roster stats. Create games with rosters to see data.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 4. Player Performance */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Top performers
        </h2>
        {topPlayers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPlayers.map((p, i) => (
              <PlayerCard key={p.playerId} player={p} rank={i + 1} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm py-8">No player stats yet.</p>
        )}
      </section>

      {/* 5. Detailed Stats – Collapsible */}
      <section>
        <button
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          {detailsOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {detailsOpen ? "Hide" : "Show"} detailed stats
        </button>

        {detailsOpen && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-turf-600/50 bg-turf-800/30 p-6">
              <h3 className="text-base font-semibold text-white mb-4">All players</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {playsPerPlayer.map((p) => (
                  <div
                    key={p.playerId}
                    className="flex justify-between items-center py-2 border-b border-turf-700/50 last:border-0"
                  >
                    <span className="text-slate-300 text-sm truncate">
                      {p.playerNumber != null ? `#${p.playerNumber} ` : ""}
                      {p.playerName}
                    </span>
                    <span className="text-accent font-medium text-sm shrink-0 ml-2">
                      {p.totalPlays}
                    </span>
                  </div>
                ))}
                {playsPerPlayer.length === 0 && (
                  <p className="text-slate-500 text-sm">No data</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-turf-600/50 bg-turf-800/30 p-6">
              <h3 className="text-base font-semibold text-white mb-4">All rosters</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {playsPerRoster.map((r) => (
                  <div
                    key={r.rosterId}
                    className="flex justify-between items-center py-2 border-b border-turf-700/50 last:border-0"
                  >
                    <span className="text-slate-300 text-sm truncate">{r.rosterName}</span>
                    <span className="text-accent font-medium text-sm shrink-0 ml-2">
                      {r.totalPlays}
                    </span>
                  </div>
                ))}
                {playsPerRoster.length === 0 && (
                  <p className="text-slate-500 text-sm">No data</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-turf-600/50 bg-turf-800/30 p-6">
              <h3 className="text-base font-semibold text-white mb-4">Event breakdown</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {distribution.map((d) => {
                  const pct = totalEvents ? ((d.count / totalEvents) * 100).toFixed(0) : 0;
                  const isPositive = POSITIVE_EVENTS.has(d.type);
                  const isDefensive = DEFENSIVE_EVENTS.has(d.type);
                  return (
                    <div
                      key={d.type}
                      className="flex justify-between items-center py-2 border-b border-turf-700/50 last:border-0"
                    >
                      <span className="text-slate-300 text-sm">{d.type}</span>
                      <span className="text-sm shrink-0 ml-2">
                        <span className={isPositive ? "text-accent" : isDefensive ? "text-amber-400" : "text-slate-400"}>
                          {d.count}
                        </span>
                        <span className="text-slate-500 ml-1">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
                {distribution.length === 0 && (
                  <p className="text-slate-500 text-sm">No events</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
