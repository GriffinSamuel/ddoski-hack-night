interface Props {
  text: string;
  /** Larger bubble used over the deletion overlay. */
  overlay?: boolean;
}

export function SpeechBubble({ text, overlay = false }: Props) {
  const box = overlay
    ? "fr-pop relative max-w-[560px] rounded-stage bg-white px-5 py-3 text-[22px] font-semibold leading-snug text-vsc-editor"
    : "fr-pop absolute left-3 right-3 top-3 z-10 rounded-stage bg-white px-3 py-2 text-[14px] font-semibold leading-snug text-vsc-editor";
  return (
    <div role="status" className={box}>
      <p className="line-clamp-4">{text}</p>
      <span className="absolute left-1/2 -bottom-1.5 size-3 -translate-x-1/2 rotate-45 bg-white" />
    </div>
  );
}
