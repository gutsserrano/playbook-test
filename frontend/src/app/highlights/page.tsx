"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Film, ExternalLink } from "lucide-react";
import { api, Clip, GameWithVideo, getVideoUrl, isYouTubeUrl, getYouTubeVideoId } from "@/lib/api";
import { formatTime } from "@/lib/formatTime";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function HighlightsPage() {
  const searchParams = useSearchParams();
  const clipId = searchParams.get("clip");
  const videoRef = useRef<{ seekTo: (t: number) => void; play: () => void } | null>(null);

  const [clips, setClips] = useState<Clip[]>([]);
  const [games, setGames] = useState<Record<string, GameWithVideo>>({});
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (selectedClip && !selectedClip.videoUrl) {
      videoRef.current?.seekTo(selectedClip.startTimestamp);
    }
  }, [selectedClip?.id, selectedClip?.videoUrl]);

  const loadClips = () => {
    api.clips.list().then(async (c) => {
      setClips(c);
      const ids = [...new Set(c.map((x) => x.gameId))];
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
  const useClipAsStandalone = Boolean(selectedClip?.videoUrl);
  const youtubeClipEmbed = hasYoutubeGame && selectedClip && !hasClipVideo
    ? `https://www.youtube.com/embed/${getYouTubeVideoId(game!.videoUrl!)}?start=${selectedClip.startTimestamp}&end=${selectedClip.endTimestamp}`
    : null;

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
        <div className="lg:col-span-2 space-y-4">
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
                    {game && ` • vs ${game.opponent}`}
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
          <div className="p-4 border-b border-turf-600">
            <h3 className="font-semibold text-white">All Clips</h3>
            <p className="text-slate-500 text-sm">{clips.length} clips</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-turf-600">
            {clips.map((c) => {
              const g = games[c.gameId];
              return (
                <div
                  key={c.id}
                  className={`w-full text-left hover:bg-turf-700 transition-colors ${
                    selectedClip?.id === c.id ? "bg-accent/10 border-l-4 border-accent" : ""
                  }`}
                >
                  <button
                    onClick={() => setSelectedClip(c)}
                    className="w-full text-left p-4"
                  >
                    <p className="font-medium text-white text-sm truncate">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {g?.opponent || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {formatTime(c.startTimestamp)} – {formatTime(c.endTimestamp)}
                    </p>
                  </button>
                  {g && (
                    <div className="px-4 pb-4">
                      <Link
                        href={`/games/${g.id}`}
                        className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View full game
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
            {clips.length === 0 && (
              <p className="p-4 text-slate-500 text-sm">No clips yet. Create clips in game analysis.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
