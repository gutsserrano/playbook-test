const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const SERVER_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export function getVideoUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${SERVER_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function isYouTubeUrl(url?: string): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export async function fetchYouTubeDuration(url: string): Promise<number> {
  const res = await fetch(
    `${API_BASE.replace(/\/$/, "")}/youtube/duration?url=${encodeURIComponent(url)}`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to get duration (${res.status})`);
  }
  const data = await res.json();
  return data.duration;
}

export function getYouTubeVideoId(url: string): string | null {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return id || null;
    }
    const m = url.match(/[?&]v=([^&]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    const message = text || `API error: ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  teams: {
    list: () => fetchApi<Team[]>("/teams"),
    get: (id: string) => fetchApi<Team>(`/teams/${id}`),
    create: (data: { name: string }) =>
      fetchApi<Team>("/teams", { method: "POST", body: JSON.stringify(data) }),
  },
  players: {
    list: (teamId?: string) =>
      fetchApi<Player[]>(`/players${teamId ? `?teamId=${teamId}` : ""}`),
    get: (id: string) => fetchApi<Player>(`/players/${id}`),
    create: (data: CreatePlayer) =>
      fetchApi<Player>("/players", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: { name: string; number?: number | null; position: string }) =>
      fetchApi<Player>(`/players/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchApi<void>(`/players/${id}`, { method: "DELETE" }),
  },
  games: {
    list: (teamId?: string) =>
      fetchApi<GameWithVideo[]>(`/games${teamId ? `?teamId=${teamId}` : ""}`),
    get: (id: string) => fetchApi<GameWithVideo>(`/games/${id}`),
    delete: (id: string) =>
      fetchApi<void>(`/games/${id}`, { method: "DELETE" }),
    linkYoutubeVideo: (gameId: string, data: { url: string; duration: number }) =>
      fetchApi<{ id: string; gameId: string; videoUrl: string; duration: number }>(`/games/${gameId}/videos/youtube`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    create: (data: CreateGame) =>
      fetchApi<Game>("/games", { method: "POST", body: JSON.stringify(data) }),
    getPlayers: (gameId: string) =>
      fetchApi<Player[]>(`/games/${gameId}/players`),
    events: (gameId: string) => fetchApi<Event[]>(`/games/${gameId}/events`),
    createEvent: (gameId: string, data: CreateEvent) =>
      fetchApi<Event>(`/games/${gameId}/events`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateEvent: (gameId: string, eventId: string, data: Omit<CreateEvent, "timestamp"> & { timestamp: number }) =>
      fetchApi<Event>(`/games/${gameId}/events/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteEvent: (gameId: string, eventId: string) =>
      fetchApi<void>(`/games/${gameId}/events/${eventId}`, { method: "DELETE" }),
    uploadVideo: (
      gameId: string,
      file: File,
      duration: number,
      onProgress?: (percent: number) => void
    ): Promise<{ id: string; gameId: string; videoUrl: string; duration: number }> => {
      return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append("file", file);
        form.append("duration", duration.toString());
        const base = API_BASE.replace(/\/$/, "");
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            onProgress?.(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error("Invalid response"));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

        xhr.open("POST", `${base}/games/${gameId}/videos`);
        xhr.send(form);
      });
    },
  },
  clips: {
    list: (params?: { gameId?: string; playerId?: string }) => {
      if (!params?.gameId && !params?.playerId) return fetchApi<Clip[]>("/clips");
      const q = new URLSearchParams();
      if (params.gameId) q.set("gameId", params.gameId);
      if (params.playerId) q.set("playerId", params.playerId);
      return fetchApi<Clip[]>(`/clips?${q.toString()}`);
    },
    get: (id: string) => fetchApi<Clip>(`/clips/${id}`),
    create: (data: CreateClip) =>
      fetchApi<Clip>("/clips", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: { startTimestamp: number; endTimestamp: number; playerId?: string; title: string }) =>
      fetchApi<Clip>(`/clips/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchApi<void>(`/clips/${id}`, { method: "DELETE" }),
  },
  rosters: {
    list: (teamId?: string) =>
      fetchApi<Roster[]>(`/rosters${teamId ? `?teamId=${teamId}` : ""}`),
    get: (id: string) =>
      fetchApi<RosterWithPlayers>(`/rosters/${id}`),
    create: (data: { name: string; teamId: string }) =>
      fetchApi<Roster>("/rosters", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: { name: string }) =>
      fetchApi<Roster>(`/rosters/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    setPlayers: (id: string, playerIds: string[]) =>
      fetchApi<RosterWithPlayers>(`/rosters/${id}/players`, {
        method: "PUT",
        body: JSON.stringify({ playerIds }),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/rosters/${id}`, { method: "DELETE" }),
  },
  analytics: {
    playsPerPlayer: (params?: { teamId?: string; playerId?: string; gameId?: string }) => {
      const q = new URLSearchParams();
      if (params?.teamId) q.set("teamId", params.teamId);
      if (params?.playerId) q.set("playerId", params.playerId);
      if (params?.gameId) q.set("gameId", params.gameId);
      const query = q.toString();
      return fetchApi<PlaysPerPlayer[]>(`/analytics/plays-per-player${query ? `?${query}` : ""}`);
    },
    eventDistribution: (params?: { gameId?: string; teamId?: string }) => {
      const q = new URLSearchParams(params as Record<string, string>).toString();
      return fetchApi<EventDistribution[]>(`/analytics/event-distribution${q ? `?${q}` : ""}`);
    },
    playsPerRoster: (params?: { teamId?: string; gameId?: string }) => {
      const q = new URLSearchParams();
      if (params?.teamId) q.set("teamId", params.teamId);
      if (params?.gameId) q.set("gameId", params.gameId);
      const query = q.toString();
      return fetchApi<PlaysPerRoster[]>(`/analytics/plays-per-roster${query ? `?${query}` : ""}`);
    },
  },
};

export interface Team {
  id: string;
  name: string;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  number?: number | null;
  position: string;
  teamId: string;
}

export interface Game {
  id: string;
  name: string;
  date: string;
  teamId: string;
  rosterId?: string | null;
}

export interface GameWithVideo extends Game {
  videoUrl?: string;
  videoDuration?: number;
}

export interface Roster {
  id: string;
  name: string;
  teamId: string;
  createdAt: string;
}

export interface RosterWithPlayers extends Roster {
  players: Player[];
}

export interface Event {
  id: string;
  gameId: string;
  playerId?: string;
  playerName?: string;
  timestamp: number;
  type: string;
  notes?: string;
}

export interface Clip {
  id: string;
  gameId: string;
  startTimestamp: number;
  endTimestamp: number;
  playerId?: string;
  title: string;
  videoUrl?: string;
}

export interface CreatePlayer {
  name: string;
  number?: number | null;
  position: string;
  teamId: string;
}

export interface CreateGame {
  name: string;
  date: string;
  teamId: string;
  rosterId?: string | null;
}

export interface CreateEvent {
  playerId?: string;
  timestamp: number;
  type: string;
  notes?: string;
}

export interface CreateClip {
  gameId: string;
  startTimestamp: number;
  endTimestamp: number;
  playerId?: string;
  title: string;
}

export interface PlaysPerPlayer {
  playerId: string;
  playerName: string;
  playerNumber?: number | null;
  totalPlays: number;
  byType: { type: string; count: number }[];
}

export interface EventDistribution {
  type: string;
  count: number;
}

export interface PlaysPerRoster {
  rosterId: string;
  rosterName: string;
  totalPlays: number;
  byType: { type: string; count: number }[];
}
