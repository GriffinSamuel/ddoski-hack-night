import { AnimatedAvatar } from "@/components/AvatarFace";
import { SpeechBubble } from "@/components/SpeechBubble";
import type { AvatarConfig } from "@/lib/avatars";

interface Props {
  avatar: AvatarConfig;
  fileName: string;
  bubble: string | null;
}

/** Unskippable ~3 s cover over the Monaco box. The parent unmounts it at 3000 ms. */
export function DeletionOverlay({ avatar, fileName, bubble }: Props) {
  return (
    <div className="absolute inset-0 z-50 overflow-hidden fr-overlay cursor-wait select-none">
      <div className="fr-cover absolute inset-0 bg-vsc-editor" />
      <div className="fr-sweep absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-vsc-danger/60 to-transparent" />
      <div className="fr-glitch absolute inset-x-0 h-3 top-[22%] bg-vsc-danger/40" />
      <div className="fr-glitch absolute inset-x-0 h-5 top-[51%] bg-vsc-danger/40" />
      <div className="fr-glitch absolute inset-x-0 h-2 top-[78%] bg-vsc-danger/40" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:repeating-linear-gradient(0deg,transparent_0_3px,rgb(0_0_0/.35)_3px_4px)]" />
      <div className="absolute inset-0 grid place-content-center justify-items-center gap-4 text-center">
        {bubble && <SpeechBubble key={bubble} text={bubble} overlay />}
        <AnimatedAvatar avatar={avatar} state="laughing" size="overlay" wrapperClass="fr-avatar-in relative size-[240px]" />
        <div className="font-mono text-[28px] font-bold text-vsc-danger fr-glitch">DELETING {fileName}...</div>
        <div className="text-code text-vsc-dim font-mono">$ rm -rf ./{fileName}</div>
      </div>
    </div>
  );
}
