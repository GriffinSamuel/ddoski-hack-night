import { Undo2 } from "lucide-react";
import type { FileName } from "@/lib/types";

interface Props {
  activeFile: FileName;
  canUndo: boolean;
  onUndo: () => void;
}

export function EditorToolbar({ activeFile, canUndo, onUndo }: Props) {
  return (
    <div className="h-toolbar shrink-0 flex items-center justify-between px-3 bg-vsc-editor border-b border-vsc-border">
      <span className="text-small text-vsc-dim">roast-workspace &gt; {activeFile}</span>
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`h-6 px-3 flex items-center gap-1.5 text-ui bg-vsc-accent text-white rounded-none ${
          canUndo ? "hover:bg-vsc-accent-hover" : "opacity-40 cursor-not-allowed"
        }`}
      >
        <Undo2 size={14} aria-hidden="true" />
        Undo roast
      </button>
    </div>
  );
}
