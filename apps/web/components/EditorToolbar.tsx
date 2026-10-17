import { Play, RotateCcw, Undo2 } from "lucide-react";
import type { FileName } from "@/lib/types";

interface Props {
  activeFile: FileName;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onRun: () => void;
  running: boolean;
}

export function EditorToolbar({ activeFile, canUndo, onUndo, onReset, onRun, running }: Props) {
  return (
    <div className="h-toolbar shrink-0 flex items-center justify-between px-3 bg-vsc-editor border-b border-vsc-border">
      <span className="text-small text-vsc-dim">roast-workspace &gt; {activeFile}</span>
      <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onRun}
        disabled={running}
        title="Run the open file with Python, in your browser"
        className={`h-6 px-3 flex items-center gap-1.5 text-ui text-white rounded-none bg-emo-happy/80 ${
          running ? "opacity-50 cursor-wait" : "hover:bg-emo-happy"
        }`}
      >
        <Play size={14} aria-hidden="true" />
        {running ? "Running..." : "Run"}
      </button>
      <button
        type="button"
        onClick={onReset}
        title="Restore both files and calm the avatar"
        className="h-6 px-3 flex items-center gap-1.5 text-ui bg-vsc-tabbar text-vsc-text border border-vsc-border rounded-none hover:bg-vsc-activity"
      >
        <RotateCcw size={14} aria-hidden="true" />
        Reset
      </button>
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
    </div>
  );
}
