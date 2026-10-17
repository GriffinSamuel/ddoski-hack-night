import { VideoOff } from "lucide-react";
import type { CameraStatus } from "@/lib/types";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
}

export function CameraTile({ videoRef, status }: Props) {
  if (status === "unavailable") {
    return (
      <div className="h-[150px] shrink-0 grid place-content-center justify-items-center gap-1 bg-vsc-sidebar border border-dashed border-vsc-border text-small text-vsc-dim">
        <VideoOff size={24} aria-hidden="true" />
        Camera unavailable
      </div>
    );
  }
  return (
    <div className="relative h-[150px] shrink-0 overflow-hidden border border-vsc-border bg-black">
      <video ref={videoRef} className="h-full w-full object-cover -scale-x-100" muted playsInline autoPlay />
      {status === "ready" && (
        <div className="absolute left-2 top-2 flex items-center gap-1.5 bg-black/60 px-1.5 py-0.5 text-[11px] text-white">
          <span className="size-2 rounded-full bg-vsc-danger animate-pulse" />
          LIVE
        </div>
      )}
    </div>
  );
}
