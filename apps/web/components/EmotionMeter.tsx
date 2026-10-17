import type { Emotion, EmotionScores } from "@/lib/types";

interface Props {
  scores: EmotionScores;
  top: Emotion;
  hold: number;
  holding: Emotion;
}

const ROWS: { key: Emotion; label: string }[] = [
  { key: "neutral", label: "neutral" },
  { key: "sad", label: "sad" },
  { key: "happy", label: "happy" },
  { key: "super-happy", label: "super-happy" },
];

const TEXT_COLOR: Record<Emotion, string> = {
  neutral: "text-emo-neutral",
  sad: "text-emo-sad",
  happy: "text-emo-happy",
  "super-happy": "text-emo-super",
};

const BG_COLOR: Record<Emotion, string> = {
  neutral: "bg-emo-neutral",
  sad: "bg-emo-sad",
  happy: "bg-emo-happy",
  "super-happy": "bg-emo-super",
};

const pct = (n: number) => Math.round(n * 100);

export function EmotionMeter({ scores, top, hold, holding }: Props) {
  return (
    <div className="shrink-0 border border-vsc-border bg-vsc-editor p-2 flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-small text-vsc-dim">DETECTED</span>
        <span className={`text-[15px] font-bold uppercase ${TEXT_COLOR[top]}`}>
          {top} {pct(scores[top])}%
        </span>
      </div>
      {ROWS.map(({ key, label }) => (
        <div
          key={key}
          className={`grid grid-cols-[76px_1fr_36px] items-center gap-2 h-[18px] text-small ${
            key === top ? "text-white font-semibold" : ""
          }`}
        >
          <span className="truncate">{label}</span>
          <div className="h-2 bg-vsc-tabbar border border-vsc-border">
            <div
              className={`h-full ${BG_COLOR[key]} transition-[width] duration-150`}
              style={{ width: `${pct(scores[key])}%` }}
            />
          </div>
          <span className="text-right tabular-nums">{pct(scores[key])}%</span>
        </div>
      ))}
      <div className={holding === "neutral" ? "opacity-50" : ""}>
        <div className="text-small text-vsc-dim">HOLD</div>
        <div className="h-1.5 bg-vsc-tabbar border border-vsc-border">
          <div className={`h-full ${BG_COLOR[holding]}`} style={{ width: `${Math.round(hold * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
