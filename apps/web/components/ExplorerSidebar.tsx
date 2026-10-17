import { ChevronDown, FileCode } from "lucide-react";
import { FILE_NAMES } from "@/lib/seed-files";
import type { FileName } from "@/lib/types";

interface Props {
  activeFile: FileName;
  onOpen: (file: FileName) => void;
}

export function ExplorerSidebar({ activeFile, onOpen }: Props) {
  return (
    <aside className="w-explorer shrink-0 bg-vsc-sidebar border-r border-vsc-border flex flex-col">
      <div className="h-[35px] px-5 flex items-center text-[11px] tracking-wide uppercase text-vsc-dim">EXPLORER</div>
      <div className="h-[22px] px-2 flex items-center gap-1 text-[11px] font-bold uppercase">
        <ChevronDown size={16} aria-hidden="true" />
        ROAST-WORKSPACE
      </div>
      {FILE_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onOpen(name)}
          className={`h-[22px] w-full pl-7 pr-2 flex items-center gap-2 text-ui text-left hover:bg-vsc-hover ${
            name === activeFile ? "bg-vsc-list-active text-white" : "text-vsc-text"
          }`}
        >
          <FileCode size={16} className="text-emo-sad" aria-hidden="true" />
          {name}
        </button>
      ))}
    </aside>
  );
}
