"use client";

import { useEffect, useRef } from "react";
import type { Emotion } from "@/lib/types";

interface Handlers {
  onForce: (emotion: Emotion) => void;
  onToggleDetection: () => void;
  onToggleMode: () => void;
  /** While true (deletion overlay playing) every key is swallowed. */
  locked: boolean;
}

const FORCE_KEYS: Record<string, Emotion> = {
  Digit1: "neutral",
  Digit2: "sad",
  Digit3: "super-happy",
  Digit4: "super-happy",
};

/** Window-level capture listener so the hotkeys work while Monaco has focus. */
export function useHotkeys(handlers: Handlers) {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const h = ref.current;
      if (h.locked) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const forced = FORCE_KEYS[e.code];
      if (forced) {
        e.preventDefault();
        e.stopPropagation();
        h.onForce(forced);
      } else if (e.code === "Digit0") {
        e.preventDefault();
        e.stopPropagation();
        h.onToggleDetection();
      } else if (e.code === "KeyP") {
        e.preventDefault();
        e.stopPropagation();
        h.onToggleMode();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
}
