import { AnimatedAvatar } from "@/components/AvatarFace";
import { SpeechBubble } from "@/components/SpeechBubble";
import type { AvatarConfig } from "@/lib/avatars";
import type { AvatarState } from "@/lib/types";

interface Props {
  avatar: AvatarConfig;
  state: AvatarState;
  bubble: string | null;
}

export function AvatarStage({ avatar, state, bubble }: Props) {
  return (
    <div className="relative flex-1 min-h-[240px] overflow-hidden border border-vsc-border bg-vsc-editor rounded-stage bg-[radial-gradient(circle_at_50%_75%,#264f78_0%,transparent_65%)]">
      {bubble && <SpeechBubble key={bubble} text={bubble} />}
      <div className="absolute bottom-4 left-1/2 -ml-12 h-3 w-24 rounded-full bg-black/50 blur-sm" />
      <AnimatedAvatar
        avatar={avatar}
        state={state}
        size="stage"
        wrapperClass="absolute bottom-6 left-1/2 -ml-[90px] size-[180px]"
      />
      <div className="absolute bottom-1 inset-x-0 text-center text-small text-vsc-dim">{avatar.name}</div>
    </div>
  );
}
