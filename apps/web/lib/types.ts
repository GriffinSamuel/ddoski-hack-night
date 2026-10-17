import type { AvatarId, RoastEmotion, RoastMode } from "@/lib/api-types";

export type { AvatarId, RoastEmotion, RoastMode };

export type Emotion = "neutral" | RoastEmotion;

export type AvatarState = "idle" | "mean" | "smug" | "laughing";

export type FileName = "bad_code.py" | "good_code.py";

export type EmotionScores = Record<Emotion, number>;

export type CameraStatus = "starting" | "ready" | "unavailable";

export type AiStatus = "unknown" | "online" | "offline";
