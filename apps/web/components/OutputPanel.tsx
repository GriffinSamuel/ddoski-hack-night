import type { RunResult } from "@/lib/python-runner";

interface Props {
  result: RunResult | null;
  running: boolean;
  fileName: string;
}

/** VS Code-style TERMINAL panel under the editor showing the latest run output. */
export function OutputPanel({ result, running, fileName }: Props) {
  return (
    <div className="h-[150px] shrink-0 flex flex-col border-t border-vsc-border bg-vsc-editor">
      <div className="h-[30px] shrink-0 flex items-center gap-4 px-3 text-small uppercase tracking-wide border-b border-vsc-border">
        <span className="text-vsc-dim">Problems</span>
        <span className="text-vsc-dim">Output</span>
        <span className="text-white border-b border-white pb-[6px] -mb-[7px]">Terminal</span>
      </div>
      <pre className="flex-1 overflow-auto m-0 px-3 py-2 font-mono text-code leading-[1.45] whitespace-pre-wrap">
        <span className="text-emo-happy">roast-workspace</span>
        <span className="text-vsc-dim"> $ </span>
        <span className="text-vsc-text">python {fileName}</span>
        {"\n"}
        {running && <span className="text-vsc-dim">running (the first run downloads Python, about 10 MB)...</span>}
        {!running && result && (
          <>
            {result.output && <span className="text-vsc-text">{result.output.replace(/\n$/, "")}</span>}
            {result.output && result.error && "\n"}
            {result.error && <span className="text-vsc-danger">{result.error.trim()}</span>}
            {"\n"}
            <span className="text-vsc-dim">
              [exit {result.error ? 1 : 0} in {Math.round(result.ms)} ms]
            </span>
          </>
        )}
        {!running && !result && <span className="text-vsc-dim">Press Run to execute the open file.</span>}
      </pre>
    </div>
  );
}
