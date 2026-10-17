import type * as Monaco from "monaco-editor";
import type { FileName } from "@/lib/types";

const HIGHLIGHT_MS = 1100;

interface Snapshot {
  file: FileName;
  text: string;
}

export interface EditorController {
  getCode(file: FileName): string;
  /** Insert `# ` comment lines above `atLine` (1-based) or above the cursor line. */
  insertComments(file: FileName, lines: string[], atLine: number | null): void;
  /** Replace the whole buffer with `# ` comment lines. */
  replaceWithComments(file: FileName, lines: string[]): void;
  /** Restore the pre-edit text of the last edit. Returns the file that was restored, or null. */
  undoRoast(): FileName | null;
  /** Put every file back to its seed text and forget the undo snapshot. */
  resetAll(seeds: Record<FileName, string>): void;
  dispose(): void;
}

interface Hooks {
  onSnapshotChange: (hasSnapshot: boolean) => void;
}

export function createEditorController(
  monaco: typeof Monaco,
  editor: Monaco.editor.IStandaloneCodeEditor,
  hooks: Hooks,
): EditorController {
  let snapshot: Snapshot | null = null;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const modelFor = (file: FileName) => monaco.editor.getModel(monaco.Uri.parse(file));
  const isActive = (file: FileName) => editor.getModel()?.uri.toString() === monaco.Uri.parse(file).toString();
  const setSnapshot = (next: Snapshot | null) => {
    snapshot = next;
    hooks.onSnapshotChange(next !== null);
  };

  // Ctrl+Z back to the snapshot text clears the "Undo roast" button too.
  const contentSub = editor.onDidChangeModelContent(() => {
    if (snapshot && modelFor(snapshot.file)?.getValue() === snapshot.text) setSnapshot(null);
  });

  function applyEdit(file: FileName, model: Monaco.editor.ITextModel, range: Monaco.IRange, text: string) {
    const active = isActive(file);
    if (active) editor.pushUndoStop();
    model.pushEditOperations(editor.getSelections(), [{ range, text, forceMoveMarkers: true }], () => null);
    if (active) editor.pushUndoStop();
  }

  function highlight(file: FileName, startLine: number, count: number) {
    if (!isActive(file)) return;
    const collection = editor.createDecorationsCollection(
      Array.from({ length: count }, (_, i) => ({
        range: new monaco.Range(startLine + i, 1, startLine + i, 1),
        options: { isWholeLine: true, className: "fr-inserted-line" },
      })),
    );
    editor.revealLineInCenterIfOutsideViewport(startLine);
    const timer = setTimeout(() => {
      collection.clear();
      timers.delete(timer);
    }, HIGHLIGHT_MS);
    timers.add(timer);
  }

  return {
    getCode(file) {
      return modelFor(file)?.getValue() ?? "";
    },

    insertComments(file, lines, atLine) {
      const model = modelFor(file);
      if (!model || lines.length === 0) return;
      const cursorLine = isActive(file) ? (editor.getPosition()?.lineNumber ?? 1) : 1;
      const wanted = atLine !== null && atLine >= 1 && atLine <= model.getLineCount() ? atLine : cursorLine;
      const line = Math.min(Math.max(wanted, 1), model.getLineCount());
      setSnapshot({ file, text: model.getValue() });
      const text = lines.map((l) => `# ${l}`).join("\n") + "\n";
      applyEdit(file, model, new monaco.Range(line, 1, line, 1), text);
      highlight(file, line, lines.length);
    },

    replaceWithComments(file, lines) {
      const model = modelFor(file);
      if (!model) return;
      setSnapshot({ file, text: model.getValue() });
      const text = lines.map((l) => `# ${l}`).join("\n") + "\n";
      applyEdit(file, model, model.getFullModelRange(), text);
      highlight(file, 1, lines.length);
    },

    undoRoast() {
      if (!snapshot) return null;
      const { file, text } = snapshot;
      const model = modelFor(file);
      setSnapshot(null);
      if (!model) return null;
      if (model.getValue() !== text) applyEdit(file, model, model.getFullModelRange(), text);
      return file;
    },

    resetAll(seeds) {
      setSnapshot(null);
      (Object.keys(seeds) as FileName[]).forEach((file) => {
        const model = modelFor(file);
        if (model && model.getValue() !== seeds[file]) applyEdit(file, model, model.getFullModelRange(), seeds[file]);
      });
    },

    dispose() {
      contentSub.dispose();
      timers.forEach(clearTimeout);
      timers.clear();
    },
  };
}
