import { THRESHOLDS } from "@/lib/emotion/thresholds";
import type { Emotion, EmotionScores } from "@/lib/types";

export const ZERO_SCORES: EmotionScores = { neutral: 0, sad: 0, happy: 0, "super-happy": 0 };

export interface RawExpressions {
  neutral: number;
  sad: number;
  happy: number;
  /** Other negative expressions (angry + disgusted + fearful); a frown often lands here instead of "sad". */
  negative?: number;
}

/** Effective sadness: face-api under-reports "sad", so the other negative expressions count too. */
export function sadScore(raw: RawExpressions): number {
  return clamp01(raw.sad * THRESHOLDS.sadGain + (raw.negative ?? 0) * THRESHOLDS.negativeGain);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Map face-api expression probabilities to the four displayed scores. */
export function toScores(raw: RawExpressions): EmotionScores {
  // "happy" is retired: any smile drives the single happy state (the old super-happy behavior).
  return {
    neutral: clamp01(raw.neutral),
    sad: sadScore(raw),
    happy: 0,
    "super-happy": clamp01(raw.happy),
  };
}

/** Decide the emotion label from raw expression probabilities. */
export function classify(raw: RawExpressions): Emotion {
  if (sadScore(raw) >= THRESHOLDS.sadMin && raw.happy < THRESHOLDS.happyMin) return "sad";
  if (raw.happy >= THRESHOLDS.happyMin) return "super-happy";
  return "neutral";
}
