import { THRESHOLDS } from "@/lib/emotion/thresholds";
import type { Emotion, EmotionScores } from "@/lib/types";

export const ZERO_SCORES: EmotionScores = { neutral: 0, sad: 0, happy: 0, "super-happy": 0 };

export interface RawExpressions {
  neutral: number;
  sad: number;
  happy: number;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Map face-api expression probabilities to the four displayed scores. */
export function toScores(raw: RawExpressions): EmotionScores {
  const ramp = (raw.happy - THRESHOLDS.superRampStart) / (1 - THRESHOLDS.superRampStart);
  return {
    neutral: clamp01(raw.neutral),
    sad: clamp01(raw.sad),
    happy: clamp01(raw.happy),
    "super-happy": clamp01(ramp),
  };
}

/** Decide the emotion label from raw expression probabilities. */
export function classify(raw: RawExpressions): Emotion {
  if (raw.sad >= THRESHOLDS.sadMin && raw.sad > raw.happy) return "sad";
  if (raw.happy >= THRESHOLDS.superHappyMin) return "super-happy";
  if (raw.happy >= THRESHOLDS.happyMin) return "happy";
  return "neutral";
}
