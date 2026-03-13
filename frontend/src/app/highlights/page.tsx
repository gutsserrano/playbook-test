"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Film, ExternalLink, ChevronDown, Search } from "lucide-react";
import { api, Clip, GameWithVideo, getVideoUrl, isYouTubeUrl, getYouTubeVideoId } from "@/lib/api";
import { formatTime } from "@/lib/formatTime";
import { VideoPlayer, VideoPlayerRef } from "@/components/VideoPlayer";

function HighlightsContent() {
  const searchParams = useSearchParams();
  const clipId = searchParams.get("clip");
  const videoRef = useRef<VideoPlayerRef | null>(null);

  const [clips, setClips] = useState<Clip[]>([]);
  const [games, setGames] = useState<Record<string, GameWithVideo>>({});
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (selectedClip && !selectedClip.videoUrl) {
      videoRef.current?.seekTo(selectedClip.startTimestamp);
    }
  }, [selectedClip?.id, selectedClip?.videoUrl]);

  const loadClips = () => {
    api.clips.list().then(async (c) => {
      setClips(c);
      const ids = Array.from(new Set(c.map((x) => x.gameId)));
      const gs = await Promise.all(ids.map((id) => api.games.get(id)));
      const map: Record<string, GameWithVideo> = {};
      gs.forEach((g) => (map[g.id] = g));
      setGames(map);
      setSelectedClip((prev) => {
        const found = prev ? c.find((x) => x.id === prev.id) : (clipId ? c.find((x) => x.id === clipId) : c[0]);
        return found ?? prev ?? null;
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClips();
  }, [clipId]);

  useEffect(() => {
    if (!selectedClip || selectedClip.videoUrl) return;
    const id = setInterval(loadClips, 3000);
    return () => clearInterval(id);
  }, [selectedClip?.id, selectedClip?.videoUrl]);

  const game = selectedClip ? games[selectedClip.gameId] : null;
  const hasClipVideo = Boolean(selectedClip?.videoUrl);
  const hasYoutubeGame = Boolean(game?.videoUrl && isYouTubeUrl(game.videoUrl));
  const hasVideo = hasClipVideo || hasYoutubeGame || Boolean(game?.videoUrl);
  const videoUrl = hasClipVideo
    ? getVideoUrl(selectedClip!.videoUrl)
    : game?.videoUrl
      ? getVideoUrl(game.videoUrl)
      : "";
  const duration = hasClipVideo
    ? selectedClip!.endTimestamp - selectedClip!.startTimestamp
    : game?.videoDuration || 0;
  const youtubeClipEmbed = hasYoutubeGame && selectedClip && !hasClipVideo
    ? `https://www.youtube.com/embed/${getYouTubeVideoId(game!.videoUrl!)}?start=${selectedClip.startTimestamp}&end=${selectedClip.endTimestamp}`
    : null;

  const filteredClips = clips.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const gameName = games[c.gameId]?.name?.toLowerCase() ?? "";
    return c.title.toLowerCase().includes(q) || gameName.includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading highlights...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Highlights Library</h1>
        <p className="text-slate-400 mt-1">Browse and play your saved clips</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main player - hidden on mobile, shown on lg+ */}
        <div className="hidden lg:block lg:col-span-2 space-y-4">
          {selectedClip && (hasClipVideo || youtubeClipEmbed) ? (
            <div className="bg-turf-800 rounded-xl border border-turf-600 overflow-hidden">
              <div className="aspect-video bg-black w-full">
                {hasClipVideo ? (
                  <VideoPlayer
                    ref={videoRef}
                    url={videoUrl}
                    duration={duration}
                    onTimeUpdate={setCurrentTime}
                    playRange={null}
                  />
                ) : youtubeClipEmbed ? (
                  <iframe
                    src={youtubeClipEmbed}
                    title={selectedClip.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : null}
              </div>
              <div className="p-4 border-t border-turf-600 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{selectedClip.title}</p>
                  <p className="text-sm text-slate-500">
                    Clip: {formatTime(selectedClip.startTimestamp)} – {formatTime(selectedClip.endTimestamp)}
                    {game && ` • ${game.name}`}
                  </p>
                </div>
                {game && (
                  <Link
                    href={`/games/${game.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-turf-600 text-white font-medium rounded-lg hover:bg-turf-500 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch full game
                  </Link>
                )}
              </div>
            </div>
          ) : selectedClip && !hasClipVideo && !hasYoutubeGame ? (
            <div className="bg-turf-800 rounded-xl border border-turf-600 p-12 flex flex-col items-center justify-center text-slate-500 gap-4">
              <Film className="w-16 h-16" />
              <p className="text-sm text-center">Clip video is being generated.</p>
              <p className="text-xs text-slate-500">Refresh the page in a few seconds.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-turf-600 text-white rounded-lg hover:bg-turf-500 text-sm"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="bg-turf-800 rounded-xl border border-turf-600 p-12 flex items-center justify-center text-slate-500">
              <Film className="w-16 h-16" />
            </div>
          )}
        </div>

        <div className="bg-turf-800 rounded-xl border border-turf-600 overflow-hidden">
          <div className="p-4 border-b border-turf-600 space-y-3">
            <h3 className="font-semibold text-white">All Clips</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search clips or game..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-turf-700 border border-turf-600 rounded-lg text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
            <p className="text-slate-500 text-sm">
              {filteredClips.length} of {clips.length} clips
              {search.trim() && " (filtered)"}
            </p>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-turf-600">
            {filteredClips.map((c) => {
              const g = games[c.gameId];
              const isSelected = selectedClip?.id === c.id;
              const cHasClipVideo = Boolean(c.videoUrl);
              const cGame = games[c.gameId];
              const cHasYoutubeGame = Boolean(cGame?.videoUrl && isYouTubeUrl(cGame.videoUrl));
              const cHasVideo = cHasClipVideo || cHasYoutubeGame || Boolean(cGame?.videoUrl);
              const cVideoUrl = cHasClipVideo
                ? getVideoUrl(c.videoUrl)
                : cGame?.videoUrl
                  ? getVideoUrl(cGame.videoUrl)
                  : "";
              const cDuration = cHasClipVideo
                ? c.endTimestamp - c.startTimestamp
                : cGame?.videoDuration || 0;
              const cYoutubeEmbed = cHasYoutubeGame && !cHasClipVideo && cGame?.videoUrl
                ? `https://www.youtube.com/embed/${getYouTubeVideoId(cGame.videoUrl)}?start=${c.startTimestamp}&end=${c.endTimestamp}`
                : null;

              return (
                <div
                  key={c.id}
                  className={`w-full text-left hover:bg-turf-700 transition-colors ${
                    isSelected ? "bg-accent/10 border-l-4 border-accent" : ""
                  }`}
                >
                  <button
                    onClick={() => setSelectedClip(isSelected ? null : c)}
                    className="w-full text-left p-4 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm truncate">{c.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {g?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {formatTime(c.startTimestamp)} – {formatTime(c.endTimestamp)}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${isSelected ? "rotate-180" : ""}`} />
                  </button>
                  {/* Mobile: expandable player when clip is selected */}
                  {isSelected && (
                    <div className="lg:hidden border-t border-turf-600">
                      {(cHasClipVideo || cYoutubeEmbed) ? (
                        <div className="p-2">
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            {cHasClipVideo ? (
                              <VideoPlayer
                                ref={videoRef}
                                url={cVideoUrl}
                                duration={cDuration}
                                onTimeUpdate={setCurrentTime}
                                playRange={null}
                              />
                            ) : cYoutubeEmbed ? (
                              <iframe
                                src={cYoutubeEmbed}
                                title={c.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 px-1">
                            <span className="text-xs text-slate-500">
                              {formatTime(c.startTimestamp)} – {formatTime(c.endTimestamp)}
                              {g && ` • ${g.name}`}
                            </span>
                            {g && (
                              <Link
                                href={`/games/${g.id}`}
                                className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Full game
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : !cHasClipVideo && !cHasYoutubeGame ? (
                        <div className="p-6 flex flex-col items-center justify-center text-slate-500 gap-2">
                          <Film className="w-12 h-12" />
                          <p className="text-xs text-center">Clip video is being generated.</p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); window.location.reload(); }}
                            className="px-3 py-1.5 bg-turf-600 text-white rounded text-xs"
                          >
                            Refresh
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                  {g && (
                    <div className={`px-4 pb-4 ${isSelected ? "hidden lg:block" : ""}`}>
                      <Link
                        href={`/games/${g.id}`}
                        className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View full game
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredClips.length === 0 && (
              <p className="p-4 text-slate-500 text-sm">
                {clips.length === 0
                  ? "No clips yet. Create clips in game analysis."
                  : "No clips match your search."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HighlightsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading highlights...</div>
      </div>
    }>
      <HighlightsContent />
    </Suspense>
  );
}
