import { Blocks, Bug, Files, GitBranch, Search, type LucideIcon } from "lucide-react";

const ICONS: { Icon: LucideIcon; active: boolean }[] = [
  { Icon: Files, active: true },
  { Icon: Search, active: false },
  { Icon: GitBranch, active: false },
  { Icon: Bug, active: false },
  { Icon: Blocks, active: false },
];

export function ActivityBar() {
  return (
    <div aria-hidden="true" className="w-activity shrink-0 flex flex-col items-center bg-vsc-activity pt-1">
      {ICONS.map(({ Icon, active }, i) => (
        <div
          key={i}
          className={`h-[48px] w-full grid place-items-center ${
            active ? "text-white border-l-2 border-white bg-white/5" : "text-vsc-muted"
          }`}
        >
          <Icon size={24} />
        </div>
      ))}
    </div>
  );
}
