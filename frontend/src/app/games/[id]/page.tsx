"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Film, Pencil, Plus, Scissors, Trash2, Upload } from "lucide-react";
import { api, GameWithVideo, Event, Clip, getVideoUrl, isYouTubeUrl, fetchYouTubeDuration } from "@/lib/api";
import { formatTime } from "@/lib/formatTime";
import { VideoPlayer } from "@/components/VideoPlayer";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { EventsTimeline } from "@/components/EventsTimeline";
import { AddEventModal } from "@/components/AddEventModal";
import { CreateClipModal } from "@/components/CreateClipModal";
import { EditEventModal } from "@/components/EditEventModal";
import { EditClipModal } from "@/components/EditClipModal";

export default function GameAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const videoRef = useRef<{ seekTo: (t: number) => void; play: () => void; pause: () => void; getCurrentTime: () => number } | null>(null);

  const [game, setGame] = useState<GameWithVideo | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string; number: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showCreateClip, setShowCreateClip] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingClip, setEditingClip] = useState<Clip | null>(null);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [showYoutubeForm, setShowYoutubeForm] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeDuration, setYoutubeDuration] = useState<number | null>(null);
  const [fetchingDuration, setFetchingDuration] = useState(false);
  const [linkingYoutube, setLinkingYoutube] = useState(false);
  const addEventTimestampRef = useRef(0);
  const [createClipInitialTime, setCreateClipInitialTime] = useState(0);
  const [showDeleteGameModal, setShowDeleteGameModal] = useState(false);
  const [deletingGame, setDeletingGame] = useState(false);

  const load = () => {
    api.games.get(id).then((g) => {
      setGame(g);
      return Promise.all([
        Promise.resolve(g),
        api.games.events(id),
        api.clips.list({ gameId: id }),
        api.players.list(g.teamId),
      ]);
    }).then(([g, e, c, p]) => {
      setEvents(e);
      setClips(c);
      setPlayers(p.map((x) => ({ id: x.id, name: x.name, number: x.number })));
    })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (!showYoutubeForm || !youtubeUrl.trim()) {
      setYoutubeDuration(null);
      setFetchingDuration(false);
      return;
    }
    const trimmed = youtubeUrl.trim();
    if (!trimmed.includes("youtube.com") && !trimmed.includes("youtu.be")) return;
    const t = setTimeout(() => {
      setFetchingDuration(true);
      setYoutubeDuration(null);
      fetchYouTubeDuration(trimmed)
        .then((dur) => setYoutubeDuration(dur))
        .catch(() => setYoutubeDuration(null))
        .finally(() => setFetchingDuration(false));
    }, 500);
    return () => clearTimeout(t);
  }, [showYoutubeForm, youtubeUrl]);

  const onAddEvent = async (data: { playerId?: string; type: string; notes?: string }) => {
    await api.games.createEvent(id, {
      playerId: data.playerId,
      timestamp: addEventTimestampRef.current,
      type: data.type,
      notes: data.notes,
    });
    load();
    setShowAddEvent(false);
  };

  const onStartClip = () => {
    const t = videoRef.current?.getCurrentTime?.() ?? currentTime;
    setCreateClipInitialTime(Math.floor(t));
    setShowCreateClip(true);
  };

  const onCreateClip = async (data: { startTimestamp: number; endTimestamp: number; playerId?: string; title: string }) => {
    await api.clips.create({
      gameId: id,
      startTimestamp: data.startTimestamp,
      endTimestamp: data.endTimestamp,
      playerId: data.playerId,
      title: data.title,
    });
    await load();
    setShowCreateClip(false);
  };

  const onUpdateEvent = async (eventId: string, data: { playerId?: string; type: string; notes?: string }) => {
    if (!editingEvent) return;
    await api.games.updateEvent(id, eventId, {
      ...data,
      timestamp: editingEvent.timestamp,
    });
    load();
    setEditingEvent(null);
  };

  const onDeleteEvent = async (eventId: string) => {
    if (!confirm("Delete this event?")) return;
    await api.games.deleteEvent(id, eventId);
    load();
  };

  const onUpdateClip = async (clipId: string, data: { startTimestamp: number; endTimestamp: number; playerId?: string; title: string }) => {
    await api.clips.update(clipId, data);
    load();
    setEditingClip(null);
    if (selectedClip?.id === clipId) setSelectedClip({ ...selectedClip, ...data });
  };

  const onDeleteClip = async (clipId: string) => {
    if (!confirm("Delete this clip?")) return;
    await api.clips.delete(clipId);
    if (selectedClip?.id === clipId) setSelectedClip(null);
    load();
  };

  const onDeleteGame = async () => {
    setDeletingGame(true);
    try {
      await api.games.delete(id);
      router.push("/games");
    } catch (err) {
      console.error(err);
      setUploadError("Failed to delete game");
      setShowDeleteGameModal(false);
    } finally {
      setDeletingGame(false);
    }
  };

  const onClipSelect = (clip: Clip) => {
    if (selectedClip?.id === clip.id) {
      setSelectedClip(null);
    } else {
      setSelectedClip(clip);
      videoRef.current?.seekTo(clip.startTimestamp);
      videoRef.current?.play();
    }
  };

  const onVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !game) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    try {
      const duration = await new Promise<number>((resolve, reject) => {
        const v = document.createElement("video");
        const blobUrl = URL.createObjectURL(file);
        v.preload = "metadata";
        v.onloadedmetadata = () => {
          resolve(Math.floor(v.duration));
          URL.revokeObjectURL(blobUrl);
        };
        v.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          reject(new Error("Could not read video"));
        };
        v.src = blobUrl;
      });
      await api.games.uploadVideo(id, file, duration, (p) => setUploadProgress(p));
      setUploadProgress(100);
      setPlaybackError(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const hasVideo = Boolean(game?.videoUrl);
  const isYoutube = isYouTubeUrl(game?.videoUrl);
  const videoUrl = game?.videoUrl ? getVideoUrl(game.videoUrl) : "";

  const onLinkYoutube = async () => {
    const dur = youtubeDuration ?? 0;
    if (!youtubeUrl.trim() || dur < 1) {
      setUploadError("Enter a valid YouTube URL and wait for duration to load");
      return;
    }
    setLinkingYoutube(true);
    setUploadError(null);
    try {
      await api.games.linkYoutubeVideo(id, { url: youtubeUrl.trim(), duration: dur });
      await load();
      setShowYoutubeForm(false);
      setYoutubeUrl("");
      setYoutubeDuration(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to link YouTube video");
    } finally {
      setLinkingYoutube(false);
    }
  };

  if (loading || !game) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          href="/games"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Games
        </Link>
        <Link
          href="/highlights"
          className="flex items-center gap-2 text-slate-400 hover:text-accent transition-colors"
        >
          <Film className="w-5 h-5" />
          Highlights Library
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">vs {game.opponent}</h1>
          <p className="text-slate-400 text-sm">
            {new Date(game.date).toLocaleDateString()} • Game Analysis
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteGameModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete game
        </button>
      </div>

      {showDeleteGameModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteGameModal(false)}
        >
          <div className="bg-turf-800 rounded-xl border border-turf-600 w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-3">Delete game?</h3>
            <p className="text-slate-400 text-sm mb-4">
              This will permanently delete <strong className="text-white">vs {game.opponent}</strong> and all related information:
            </p>
            <ul className="text-slate-400 text-sm space-y-1 mb-6 list-disc list-inside">
              <li>All events (goals, assists, saves, etc.)</li>
              <li>All highlights and clips</li>
              <li>Game video and stats</li>
            </ul>
            <p className="text-amber-400/90 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteGameModal(false)}
                className="flex-1 px-4 py-2 border border-turf-600 rounded-lg text-slate-300 hover:bg-turf-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDeleteGame}
                disabled={deletingGame}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-70 text-white font-medium rounded-lg transition-colors"
              >
                {deletingGame ? "Deleting…" : "Delete game"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-turf-800 rounded-xl border border-turf-600 overflow-hidden">
        {hasVideo ? (
          <>
            <div className="aspect-video bg-black relative">
              {isYoutube ? (
                <YouTubePlayer
                  key={videoUrl}
                  ref={videoRef}
                  url={videoUrl}
                  duration={game.videoDuration || 0}
                  onTimeUpdate={setCurrentTime}
                  playRange={selectedClip ? { start: selectedClip.startTimestamp, end: selectedClip.endTimestamp } : null}
                  onError={setPlaybackError}
                />
              ) : (
                <VideoPlayer
                  ref={videoRef}
                  url={videoUrl}
                  duration={game.videoDuration || 0}
                  onTimeUpdate={setCurrentTime}
                  playRange={selectedClip ? { start: selectedClip.startTimestamp, end: selectedClip.endTimestamp } : null}
                  onError={setPlaybackError}
                />
              )}
              {playbackError && (
                <div className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {playbackError}
                  <button
                    type="button"
                    onClick={() => setPlaybackError(null)}
                    className="ml-2 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-turf-600 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                {!isYoutube && (
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${uploading ? "bg-turf-500 text-slate-400" : "bg-turf-600 text-white hover:bg-turf-500"}`}>
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading…" : "Upload another video"}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={onVideoUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
                {uploading && (
                  <div className="w-32 h-2 bg-turf-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  const t = videoRef.current?.getCurrentTime?.() ?? currentTime;
                  addEventTimestampRef.current = Math.floor(t);
                  setShowAddEvent(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-turf-950 font-medium rounded-lg hover:bg-accent-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add event at {formatTime(currentTime)}
              </button>
              <button
                onClick={onStartClip}
                className="flex items-center gap-2 px-4 py-2 bg-turf-600 text-white font-medium rounded-lg hover:bg-turf-500 transition-colors"
              >
                <Scissors className="w-4 h-4" />
                Create clip
              </button>
              {uploadError && (
                <div className="w-full px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button type="button" onClick={() => setUploadError(null)} className="underline">Dismiss</button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-turf-600">
              {selectedClip && (
                <button
                  onClick={() => setSelectedClip(null)}
                  className="text-sm text-accent hover:text-accent-hover font-medium mb-3 block"
                >
                  ← Show full video
                </button>
              )}
              <h4 className="text-xs font-semibold text-slate-400 mb-2">Events & clips – click to seek/play</h4>
              <EventsTimeline
                duration={game.videoDuration || 0}
                events={events}
                clips={clips}
                currentTime={currentTime}
                selectedClipId={selectedClip?.id}
                onSeek={(t) => {
                  setSelectedClip(null);
                  videoRef.current?.seekTo(t);
                }}
                onClipClick={onClipSelect}
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`block aspect-video bg-turf-700 border-2 border-dashed border-turf-600 rounded-lg transition-colors ${uploading ? "pointer-events-none opacity-80" : "cursor-pointer hover:border-accent/50 hover:bg-turf-600/50"}`}>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  onChange={onVideoUpload}
                  disabled={uploading}
                />
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6">
                  <Upload className="w-12 h-12 text-slate-500" />
                  <p className="font-medium text-white text-sm">
                    {uploading ? "Uploading…" : "Upload video"}
                  </p>
                  <p className="text-xs text-slate-500 text-center">
                    MP4, WebM, MOV (max 500MB)
                  </p>
                  {uploading && (
                    <div className="w-full max-w-[120px]">
                      <div className="h-1.5 bg-turf-600 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </label>
              <div className="aspect-video bg-turf-700 border-2 border-dashed border-turf-600 rounded-lg p-4 flex flex-col justify-center">
                <p className="font-medium text-white text-sm mb-2">Or use YouTube</p>
                {showYoutubeForm ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-turf-600 border border-turf-500 rounded text-white text-sm placeholder-slate-500"
                    />
                    {fetchingDuration && (
                      <p className="text-sm text-slate-400">Fetching video duration…</p>
                    )}
                    {youtubeDuration != null && !fetchingDuration && (
                      <p className="text-sm text-slate-400">Duration: {Math.floor(youtubeDuration / 60)}:{String(youtubeDuration % 60).padStart(2, "0")}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onLinkYoutube}
                        disabled={linkingYoutube || fetchingDuration || youtubeDuration == null}
                        className="flex-1 px-3 py-2 bg-accent text-turf-950 font-medium rounded text-sm hover:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {linkingYoutube ? "Linking…" : "Link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowYoutubeForm(false); setUploadError(null); }}
                        className="px-3 py-2 bg-turf-600 text-slate-300 rounded text-sm hover:bg-turf-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowYoutubeForm(true)}
                    className="px-4 py-2 bg-turf-600 text-white rounded-lg text-sm hover:bg-turf-500"
                  >
                    Link YouTube video
                  </button>
                )}
              </div>
            </div>
            {uploadError && (
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex justify-between items-center">
                <span>{uploadError}</span>
                <button type="button" onClick={() => setUploadError(null)} className="underline">Dismiss</button>
              </div>
            )}
          </div>
        )}
      </div>

      {hasVideo && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-turf-800 rounded-xl border border-turf-600 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Events – click to seek</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-1 group"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClip(null);
                    videoRef.current?.seekTo(e.timestamp);
                  }}
                  className="flex-1 flex justify-between items-center py-2 px-3 rounded-lg bg-turf-700 hover:bg-turf-600 transition-colors text-left min-w-0"
                >
                  <div className="min-w-0 truncate">
                    <span className="font-medium text-white">{e.type}</span>
                    {e.playerName && (
                      <span className="text-slate-400 text-sm ml-2">({e.playerName})</span>
                    )}
                    {e.notes && (
                      <span className="text-slate-500 text-sm ml-2">— {e.notes}</span>
                    )}
                  </div>
                  <span className="text-accent text-sm font-mono shrink-0 ml-2">{formatTime(e.timestamp)}</span>
                </button>
                <button
                  type="button"
                  onClick={(ev) => { ev.stopPropagation(); setEditingEvent(e); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-turf-600 transition-colors shrink-0"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(ev) => { ev.stopPropagation(); onDeleteEvent(e.id); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-turf-600 transition-colors shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-slate-500 text-sm">No events yet. Add one above.</p>
            )}
          </div>
        </div>

        <div className="bg-turf-800 rounded-xl border border-turf-600 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Clips – click to play</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {clips.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-1 group"
              >
                <button
                  onClick={() => onClipSelect(c)}
                  className={`flex-1 flex justify-between items-center py-2 px-3 rounded-lg transition-colors text-left min-w-0 ${
                    selectedClip?.id === c.id ? "bg-accent/20 ring-1 ring-accent" : "bg-turf-700 hover:bg-turf-600"
                  }`}
                >
                  <span className="font-medium text-white truncate">{c.title}</span>
                  <span className="text-slate-500 text-sm font-mono shrink-0 ml-2">
                    {formatTime(c.startTimestamp)} – {formatTime(c.endTimestamp)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(ev) => { ev.stopPropagation(); setEditingClip(c); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-turf-600 transition-colors shrink-0"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(ev) => { ev.stopPropagation(); onDeleteClip(c.id); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-turf-600 transition-colors shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {clips.length === 0 && (
              <p className="text-slate-500 text-sm">No clips yet. Create one above.</p>
            )}
          </div>
        </div>
      </div>
      )}

      {showAddEvent && (
        <AddEventModal
          players={players}
          currentTime={addEventTimestampRef.current}
          onClose={() => setShowAddEvent(false)}
          onSubmit={onAddEvent}
        />
      )}

      {showCreateClip && (
        <CreateClipModal
          players={players}
          currentTime={createClipInitialTime}
          videoDuration={game?.videoDuration || 0}
          onClose={() => setShowCreateClip(false)}
          onSubmit={onCreateClip}
        />
      )}

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          players={players}
          onClose={() => setEditingEvent(null)}
          onSubmit={(data) => onUpdateEvent(editingEvent.id, data)}
        />
      )}

      {editingClip && game && (
        <EditClipModal
          clip={editingClip}
          players={players}
          videoDuration={game.videoDuration || 0}
          onClose={() => setEditingClip(null)}
          onSubmit={(data) => onUpdateClip(editingClip.id, data)}
        />
      )}
    </div>
  );
}
