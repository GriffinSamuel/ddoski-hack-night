"use client";

import { useState } from "react";
import { STATE_BADGE, type AvatarConfig } from "@/lib/avatars";
import type { AvatarState } from "@/lib/types";

type Size = "chip" | "stage" | "overlay";

const EMOJI_CLASS: Record<Size, string> = {
  chip: "text-[28px] leading-none",
  stage: "text-[110px] leading-none",
  overlay: "text-[150px] leading-none",
};

const BADGE_CLASS: Record<Size, string> = {
  chip: "hidden",
  stage: "absolute bottom-0 right-0 text-[44px]",
  overlay: "absolute bottom-0 right-0 text-[60px]",
};

interface FaceProps {
  avatar: AvatarConfig;
  state: AvatarState;
  size: Size;
  className?: string;
}

/** One face layer: the state's image if present and loadable, else the emoji/CSS fallback. */
export function AvatarFace({ avatar, state, size, className = "" }: FaceProps) {
  const src = avatar.images[state];
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && failedSrc !== src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${avatar.name} ${state}`}
        className={`size-full object-contain ${className}`}
        onError={() => setFailedSrc(src)}
        draggable={false}
      />
    );
  }
  return (
    <div
      className={`relative size-full grid place-items-center ${className}`}
      role="img"
      aria-label={`${avatar.name} ${state}`}
    >
      <span className={EMOJI_CLASS[size]}>{avatar.emoji}</span>
      <span className={BADGE_CLASS[size]}>{STATE_BADGE[state]}</span>
    </div>
  );
}

interface AnimatedProps {
  avatar: AvatarConfig;
  state: AvatarState;
  size: Exclude<Size, "chip">;
  wrapperClass: string;
}

/** Animated avatar: `.fr-avatar` wrapper with layer A (current state) and layer B (idle, shown only in "mean"). */
export function AnimatedAvatar({ avatar, state, size, wrapperClass }: AnimatedProps) {
  return (
    <div className={`fr-avatar ${wrapperClass}`} data-state={state}>
      <div className="fr-face fr-face--a">
        <AvatarFace avatar={avatar} state={state} size={size} />
      </div>
      <div className="fr-face fr-face--b">
        <AvatarFace avatar={avatar} state="idle" size={size} />
      </div>
    </div>
  );
}
