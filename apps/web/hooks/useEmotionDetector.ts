"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { classify, toScores, ZERO_SCORES, type RawExpressions } from "@/lib/emotion/classify";
import { MODEL_URL, THRESHOLDS } from "@/lib/emotion/thresholds";
import type { CameraStatus, Emotion, EmotionScores } from "@/lib/types";

interface Options {
  /** Alt+0 toggles this; when false only hotkeys act. */
  enabled: boolean;
  /** Called once when a detected non-neutral emotion has been held long enough (and cooldown passed). */
  onFire: (emotion: Exclude<Emotion, "neutral">) => void;
}

interface Detector {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraStatus: CameraStatus;
  scores: EmotionScores;
  top: Emotion;
  /** 0..1 progress of the current hold. */
  hold: number;
  /** Emotion currently being held (for the hold bar color), or neutral. */
  holding: Emotion;
  /** Call after any edit (detected or forced) to reset the hold and start the cooldown. */
  markFired: () => void;
}

type FaceApi = typeof import("@vladmandic/face-api");

export function useEmotionDetector({ enabled, onFire }: Options): Detector {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("starting");
  const [scores, setScores] = useState<EmotionScores>(ZERO_SCORES);
  const [top, setTop] = useState<Emotion>("neutral");
  const [hold, setHold] = useState(0);
  const [holding, setHolding] = useState<Emotion>("neutral");

  const enabledRef = useRef(enabled);
  const onFireRef = useRef(onFire);
  const currentRef = useRef<Emotion>("neutral");
  const heldSinceRef = useRef(0);
  const lastFireRef = useRef(-Infinity);

  useEffect(() => {
    enabledRef.current = enabled;
    onFireRef.current = onFire;
  });

  const markFired = useCallback(() => {
    lastFireRef.current = performance.now();
    heldSinceRef.current = performance.now();
    setHold(0);
  }, []);

  // Camera + model + detection loop.
  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    async function run() {
      attempts += 1;
      try {
        const faceapi: FaceApi = await import("@vladmandic/face-api");
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        if (cancelled) return;
        const video = videoRef.current;
        if (!video) throw new Error("video element missing");
        video.srcObject = stream;
        await video.play();
        setCameraStatus("ready");

        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: THRESHOLDS.detectorInputSize,
          scoreThreshold: THRESHOLDS.detectorScoreThreshold,
        });

        const tick = async () => {
          if (cancelled) return;
          if (enabledRef.current && video.readyState >= 2) {
            try {
              const result = await faceapi.detectSingleFace(video, options).withFaceExpressions();
              if (cancelled) return;
              const raw: RawExpressions = result
                ? {
                    neutral: result.expressions.neutral,
                    sad: result.expressions.sad,
                    happy: result.expressions.happy,
                  }
                : { neutral: 0, sad: 0, happy: 0 };
              const label: Emotion = result ? classify(raw) : "neutral";
              if (label !== currentRef.current) {
                currentRef.current = label;
                heldSinceRef.current = performance.now();
              }
              setScores(result ? toScores(raw) : ZERO_SCORES);
              setTop(label);
            } catch {
              // A single bad frame is ignored.
            }
          }
          timer = setTimeout(tick, THRESHOLDS.detectIntervalMs);
        };
        void tick();
      } catch (err) {
        // Surface the real reason in DevTools; the UI only shows the manual-mode fallback.
        console.error("[face-roast] camera/model setup failed:", err);
        if (cancelled) return;
        // Transient failures (camera busy, chunk not ready) get a few more tries before manual mode.
        if (attempts < THRESHOLDS.setupAttempts) {
          timer = setTimeout(run, THRESHOLDS.setupRetryMs);
          return;
        }
        setCameraStatus("unavailable");
      }
    }

    void run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Hold timer: authoritative for the hold bar and for firing.
  useEffect(() => {
    const id = setInterval(() => {
      const emotion = currentRef.current;
      if (!enabledRef.current || emotion === "neutral") {
        setHold((h) => (h === 0 ? h : 0));
        setHolding("neutral");
        return;
      }
      const now = performance.now();
      // The hold only starts counting once the cooldown after the last edit is over.
      const start = Math.max(heldSinceRef.current, lastFireRef.current + THRESHOLDS.cooldownMs);
      const progress = Math.min(1, Math.max(0, (now - start) / THRESHOLDS.holdMs));
      setHolding(emotion);
      setHold(progress);
      if (progress >= 1) {
        markFired();
        onFireRef.current(emotion);
      }
    }, THRESHOLDS.holdTickMs);
    return () => clearInterval(id);
  }, [markFired]);

  return { videoRef, cameraStatus, scores, top, hold, holding, markFired };
}
