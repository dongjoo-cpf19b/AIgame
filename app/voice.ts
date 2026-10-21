"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import manifest from "../public/audio/ko-v1/manifest.json";

export type VoiceRole = "hero" | "boss" | "senior" | "firefighter";

const normalize = (text: string) => text.trim().replace(/\s+/g, " ");
const clipKey = (text: string, role: VoiceRole) => `${role}\u0000${normalize(text)}`;
const clips = new Map(manifest.clips.map(clip => [clipKey(clip.text, clip.role as VoiceRole), clip.file]));

type Playback = {audio: HTMLAudioElement; cancelled: boolean; dispose: () => void};
let activePlayback: Playback | null = null;

/** Plays only pre-rendered, explicitly assigned Korean character voices.
 * Missing files and autoplay rejection stay silent and report unavailable.
 * There is deliberately no fallback to a device's unspecified TTS voice.
 */
export function useCharacterVoice(text: string, role: VoiceRole, enabled: boolean): {
  unavailable: boolean;
  retry: () => void;
} {
  const [unavailable, setUnavailable] = useState(false);
  const ownPlayback = useRef<Playback | null>(null);
  const mounted = useRef(false);
  const current = useRef({text, role, enabled});
  current.current = {text, role, enabled};

  // Calling this from a retry button invokes play() in that same user gesture,
  // rather than waiting for a state update/effect that can lose activation.
  const retry = useCallback(() => {
    ownPlayback.current?.dispose();
    ownPlayback.current = null;
    if (!mounted.current) return;
    setUnavailable(false);
    const request = current.current;
    if (!request.enabled || !normalize(request.text)) return;
    const source = clips.get(clipKey(request.text, request.role));
    if (!source || typeof Audio === "undefined") {
      setUnavailable(true);
      return;
    }

    // Only an enabled voice request may interrupt another active character.
    activePlayback?.dispose();
    const audio = new Audio();
    audio.preload = "none";
    const playback: Playback = {
      audio,
      cancelled: false,
      dispose() {
        if (playback.cancelled) return;
        playback.cancelled = true;
        audio.removeEventListener("error", fail);
        audio.removeEventListener("ended", finish);
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        if (activePlayback === playback) activePlayback = null;
      },
    };
    function fail() {
      if (playback.cancelled) return;
      playback.dispose();
      if (mounted.current) setUnavailable(true);
    }
    function finish() {
      if (activePlayback === playback) activePlayback = null;
    }
    audio.addEventListener("error", fail);
    audio.addEventListener("ended", finish);
    audio.src = source;
    ownPlayback.current = playback;
    activePlayback = playback;
    try {
      void audio.play().catch(fail);
    } catch {
      fail();
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    retry();
    return () => {
      mounted.current = false;
      // Disabled TypeLine instances must never cancel somebody else's voice.
      ownPlayback.current?.dispose();
      ownPlayback.current = null;
    };
  }, [text, role, enabled, retry]);

  return {unavailable, retry};
}
