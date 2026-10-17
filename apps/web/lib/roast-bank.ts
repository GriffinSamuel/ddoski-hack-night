import { ASCII_ART, BANK } from "@/lib/roast-bank-data";
import type { AvatarId, RoastEmotion, RoastMode } from "@/lib/types";

const MODE_INDEX: Record<RoastMode, 0 | 1> = { profane: 0, clean: 1 };

// Lines used in the previous block per avatar/emotion/mode, so no line repeats back to back.
const lastUsed = new Map<string, string[]>();

function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function bankLines(avatar: AvatarId, emotion: RoastEmotion, mode: RoastMode): string[] {
  return BANK[avatar][emotion].map((pair) => pair[MODE_INDEX[mode]]);
}

function pickBlock(avatar: AvatarId, emotion: RoastEmotion, mode: RoastMode, wanted: number): string[] {
  const key = `${avatar}:${emotion}:${mode}`;
  const pool = bankLines(avatar, emotion, mode);
  const previous = lastUsed.get(key) ?? [];
  const fresh = pool.filter((line) => !previous.includes(line));
  const candidates = fresh.length >= 2 ? fresh : pool.filter((line) => line !== previous[0]);
  const block = shuffle(candidates).slice(0, Math.min(wanted, candidates.length));
  lastUsed.set(key, block);
  return block;
}

/** 2 to 3 roast lines (sad or happy) in the avatar's voice, comment-ready. */
export function getRoastBlock(avatar: AvatarId, emotion: "sad" | "happy", mode: RoastMode): string[] {
  return pickBlock(avatar, emotion, mode, Math.random() < 0.5 ? 2 : 3);
}

let lastArt = -1;

/** Mocking comment block (2 lines) plus shared ASCII art for the super-happy replacement. */
export function getReplacement(avatar: AvatarId, mode: RoastMode): { mock: string[]; art: string[] } {
  const mock = pickBlock(avatar, "super-happy", mode, 2);
  const choices = ASCII_ART.map((_, i) => i).filter((i) => i !== lastArt);
  lastArt = choices[Math.floor(Math.random() * choices.length)];
  return { mock, art: ASCII_ART[lastArt] };
}
