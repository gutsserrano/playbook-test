"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
  getCurrentTime: () => number;
}

interface VideoPlayerProps {
  url: string;
  duration: number;
  onTimeUpdate: (time: number) => void;
  playRange?: { start: number; end: number } | null;
  onError?: (message: string) => void;
  className?: string;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  function VideoPlayer({ url, duration, onTimeUpdate, playRange, onError, className }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        const v = videoRef.current;
        if (v) v.currentTime = time;
      },
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    }));

    const checkRange = useCallback(() => {
      const v = videoRef.current;
      if (!v || !playRange) return;
      if (v.currentTime >= playRange.end) {
        v.currentTime = playRange.start;
        v.play();
      }
    }, [playRange]);

    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
      const sync = () => {
        onTimeUpdate(v.currentTime);
        checkRange();
      };
      v.addEventListener("timeupdate", sync);
      v.addEventListener("loadedmetadata", sync);
      v.addEventListener("seeked", sync);
      sync();
      return () => {
        v.removeEventListener("timeupdate", sync);
        v.removeEventListener("loadedmetadata", sync);
        v.removeEventListener("seeked", sync);
      };
    }, [onTimeUpdate, checkRange]);

    return (
      <video
        key={url}
        ref={videoRef}
        src={url}
        controls
        className={className ?? "w-full h-full"}
        preload="auto"
        onError={() => onError?.("Video failed to load. Check the file format and try again.")}
      />
    );
  }
);
