// All detector tuning lives here so it can be adjusted in venue light.
export const THRESHOLDS = {
  /** face-api expressions.sad at or above this (and above happy) counts as sad. */
  sadMin: 0.3,
  /** face-api expressions.happy at or above this counts as happy. */
  happyMin: 0.55,
  /** expressions.happy at or above this counts as super-happy. */
  superHappyMin: 0.95,
  /** Bar display only: the super-happy bar ramps from this happy score up to 1. */
  superRampStart: 0.8,
  /** Continuous hold needed before a detected emotion fires an edit. */
  holdMs: 1500,
  /** Minimum gap between edits triggered by detection. */
  cooldownMs: 6000,
  /** Detection loop pause between frames (about 6 to 7 fps including inference). */
  detectIntervalMs: 80,
  /** Hold-bar refresh rate. */
  holdTickMs: 50,
  /** Tiny face detector input size (smaller is faster). */
  detectorInputSize: 224,
  detectorScoreThreshold: 0.4,
} as const;

export const MODEL_URL = "/models";
