import { AvatarFace } from "@/components/AvatarFace";
import { AVATARS } from "@/lib/avatars";
import type { AvatarId } from "@/lib/types";

interface Props {
  selected: AvatarId;
  onSelect: (id: AvatarId) => void;
}

export function AvatarChips({ selected, onSelect }: Props) {
  return (
    <div role="radiogroup" aria-label="Avatar" className="grid grid-cols-3 gap-2">
      {AVATARS.map((avatar) => {
        const active = avatar.id === selected;
        return (
          <button
            key={avatar.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(avatar.id)}
            className={`flex flex-col items-center gap-1 py-2 border text-small rounded-[4px] ${
              active
                ? "border-vsc-status bg-vsc-selection text-white outline outline-1 outline-vsc-status"
                : "border-vsc-border bg-vsc-editor text-vsc-text hover:bg-vsc-hover"
            }`}
          >
            <span className="size-10 block">
              <AvatarFace avatar={avatar} state="idle" size="chip" />
            </span>
            {avatar.name}
          </button>
        );
      })}
    </div>
  );
}
