import { FileCode, X } from "lucide-react";
import { FILE_NAMES } from "@/lib/seed-files";
import type { FileName } from "@/lib/types";

interface Props {
  activeFile: FileName;
  onSelect: (file: FileName) => void;
}

export function TabBar({ activeFile, onSelect }: Props) {
  return (
    <div role="tablist" className="h-tab shrink-0 flex bg-vsc-tabbar">
      {FILE_NAMES.map((name) => {
        const active = name === activeFile;
        return (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(name)}
            className={`h-tab px-3 flex items-center gap-2 text-ui border-r border-vsc-border ${
              active
                ? "bg-vsc-editor text-white border-t border-t-vsc-status"
                : "bg-vsc-tabbar text-vsc-dim hover:text-vsc-text"
            }`}
          >
            <FileCode size={16} className="text-emo-sad" aria-hidden="true" />
            {name}
            <X size={14} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
