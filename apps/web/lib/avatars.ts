import type { AvatarId, AvatarState } from "@/lib/types";

export interface AvatarConfig {
  id: AvatarId;
  name: string;
  /** Character emoji used by the fallback face. */
  emoji: string;
  /** Image URL per state. A state without an entry always shows the emoji fallback. */
  images: Partial<Record<AvatarState, string>>;
}

/** State badge for the emoji fallback (same for every avatar). */
export const STATE_BADGE: Record<AvatarState, string> = {
  idle: "\u{1F610}",
  mean: "\u{1F608}",
  smug: "\u{1F60F}",
  laughing: "\u{1F923}",
};

// Only idle images are required (P0). Add other states here once the files exist in public/avatars.
export const AVATARS: AvatarConfig[] = [
  {
    id: "labubu",
    name: "Labubu",
    emoji: "\u{1F9CC}",
    images: { idle: "/avatars/labubu-idle.png" },
  },
  {
    id: "calhacks-bear",
    name: "CalHacks Bear",
    emoji: "\u{1F43B}",
    images: { idle: "/avatars/calhacks-bear-idle.png" },
  },
  {
    id: "rubber-duck",
    name: "Rubber Duck",
    emoji: "\u{1F986}",
    images: { idle: "/avatars/rubber-duck-idle.png" },
  },
];

export function getAvatar(id: AvatarId): AvatarConfig {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
