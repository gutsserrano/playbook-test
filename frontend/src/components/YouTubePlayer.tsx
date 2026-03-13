"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef, useId } from "react";
import { getYouTubeVideoId } from "@/lib/api";

export interface YouTubePlayerRef {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

interface YouTubePlayerProps {
  url: string;
  duration: number;
  onTimeUpdate: (time: number) => void;
  playRange?: { start: number; end: number } | null;
  onError?: (message: string) => void;
  className?: string;
}

declare global {
  interface Window {
    YT?: {
      Player: new (id: string, opts: Record<string, unknown>) => {
        seekTo: (t: number, seekAhead: boolean) => void;
        playVideo: () => void;
        pauseVideo: () => void;
        stopVideo: () => void;
        loadVideoById: (id: string, startSeconds?: number) => void;
        getCurrentTime: () => number;
        getVideoData: () => { video_id?: string };
        getIframe: () => HTMLIFrameElement;
      };
      PlayerState: { UNSTARTED: number; ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number };
      ready: (fn: () => void) => void;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  function YouTubePlayer({ url, onTimeUpdate, playRange, onError, className }, ref) {
    const id = useId().replace(/:/g, "");
    const containerId = `yt-${id}`;
    const playerRef = useRef<InstanceType<NonNullable<typeof window.YT>["Player"]> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const messageCleanupRef = useRef<(() => void) | null>(null);
    const onTimeUpdateRef = useRef(onTimeUpdate);
    onTimeUpdateRef.current = onTimeUpdate;

    const videoId = getYouTubeVideoId(url);

    useEffect(() => {
      if (!videoId) return;

      const initPlayer = () => {
        if (!window.YT) return;
        const opts: Record<string, unknown> = {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            html5: 1,
          },
        };
        if (playRange) {
          (opts.playerVars as Record<string, number>).start = playRange.start;
          (opts.playerVars as Record<string, number>).end = playRange.end;
        }
        const range = playRange;
        const expectedVideoId = videoId;
        opts.events = {
          onReady: (e: { target: InstanceType<NonNullable<typeof window.YT>["Player"]> }) => {
            playerRef.current = e.target;
            const player = e.target;
            // Verify correct video and loop / block recommendations
            if (range) {
              intervalRef.current = setInterval(() => {
                try {
                  const t = player.getCurrentTime();
                  if (t >= range.end) {
                    player.seekTo(range.start, true);
                  }
                  const data = player.getVideoData?.();
                  if (data?.video_id && data.video_id !== expectedVideoId) {
                    player.loadVideoById(expectedVideoId, range.start);
                  }
                } catch { /* ignore */ }
              }, 200);
            } else {
              intervalRef.current = setInterval(() => {
                try {
                  const data = player.getVideoData?.();
                  if (data?.video_id && data.video_id !== expectedVideoId) {
                    const t = player.getCurrentTime();
                    player.loadVideoById(expectedVideoId, Math.floor(t));
                  }
                } catch { /* ignore */ }
              }, 500);
            }

            const iframe = player.getIframe?.();
            const iframeWindow = iframe?.contentWindow;
            let listenInterval: ReturnType<typeof setInterval> | null = null;
            if (iframeWindow) {
              try {
                iframeWindow.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
                listenInterval = setInterval(() => {
                  try {
                    iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
                  } catch { /* ignore */ }
                }, 1000);
              } catch { /* ignore */ }
            }
            const handleMessage = (ev: MessageEvent) => {
              if (ev.source !== iframeWindow) return;
              try {
                const data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
                if (data?.event === "infoDelivery" && data?.info?.currentTime != null) {
                  const t = Number(data.info.currentTime);
                  if (!Number.isNaN(t) && t >= 0) {
                    onTimeUpdateRef.current(t);
                  }
                }
              } catch { /* ignore */ }
            };
            window.addEventListener("message", handleMessage);
            messageCleanupRef.current = () => {
              window.removeEventListener("message", handleMessage);
              if (listenInterval) clearInterval(listenInterval);
            };
          },
          onStateChange: (e: { data: number; target: InstanceType<NonNullable<typeof window.YT>["Player"]> }) => {
            if (e.data === 0) {
              try {
                e.target.stopVideo();
              } catch { /* ignore */ }
            }
          },
        };
        new window.YT!.Player(containerId, opts);
      };

      const loadApi = () => {
        if (window.YT?.ready) {
          window.YT.ready(initPlayer);
        } else {
          const tag = document.createElement("script");
          tag.src = `https://www.youtube.com/iframe_api?origin=${encodeURIComponent(window.location.origin)}`;
          const first = document.getElementsByTagName("script")[0];
          first?.parentNode?.insertBefore(tag, first);
          const prev = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = () => {
            prev?.();
            initPlayer();
          };
        }
      };

      loadApi();
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        messageCleanupRef.current?.();
        messageCleanupRef.current = null;
        playerRef.current = null;
      };
    }, [videoId, playRange?.start, playRange?.end]);

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => playerRef.current?.seekTo(time, true),
      play: () => playerRef.current?.playVideo(),
      pause: () => playerRef.current?.pauseVideo(),
      getCurrentTime: () => {
        try {
          return playerRef.current?.getCurrentTime() ?? 0;
        } catch {
          return 0;
        }
      },
    }));

    if (!videoId) {
      return <div className={className}>Invalid YouTube URL</div>;
    }

    return <div id={containerId} className={className ?? "w-full h-full"} />;
  }
);
