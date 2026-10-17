import { Bot, Smile } from "lucide-react";
import type { AiStatus, CameraStatus, Emotion, RoastMode } from "@/lib/types";

interface Props {
  avatarName: string;
  emotion: Emotion;
  cameraStatus: CameraStatus;
  detectionOn: boolean;
  aiStatus: AiStatus;
  mode: RoastMode;
  line: number;
  column: number;
}

const ITEM = "h-full px-2.5 flex items-center gap-1.5 hover:bg-white/15";

function aiText(status: AiStatus): string {
  if (status === "online") return "AI online";
  if (status === "offline") return "AI offline - using roast bank";
  return "AI: checking...";
}

export function StatusBar({ avatarName, emotion, cameraStatus, detectionOn, aiStatus, mode, line, column }: Props) {
  return (
    <div className="h-status shrink-0 flex items-center justify-between bg-vsc-status text-small text-white select-none">
      <div className="h-full flex items-center">
        <span className={ITEM}>
          <Bot size={14} aria-hidden="true" />
          {avatarName}
        </span>
        <span className={ITEM}>
          <Smile size={14} aria-hidden="true" />
          {emotion}
        </span>
      </div>
      <div className="h-full flex items-center">
        {cameraStatus === "unavailable" && <span className={ITEM}>Camera unavailable - manual mode</span>}
        {!detectionOn && <span className={ITEM}>Detection paused</span>}
        <span className={ITEM}>{aiText(aiStatus)}</span>
        <span className={ITEM}>
          Ln {line}, Col {column}
        </span>
        <span className={ITEM}>Python</span>
        <span className={`${ITEM} ${mode === "profane" ? "bg-vsc-status-warn" : ""}`}>Mode: {mode}</span>
      </div>
    </div>
  );
}
