"use client";

import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { createEditorController, type EditorController } from "@/lib/editor-controller";
import { monaco } from "@/lib/monaco-setup";
import { SEED_FILES } from "@/lib/seed-files";
import type { FileName } from "@/lib/types";

interface Props {
  activeFile: FileName;
  readOnly: boolean;
  onController: (controller: EditorController | null) => void;
  onSnapshotChange: (hasSnapshot: boolean) => void;
  onCursor: (line: number, column: number) => void;
}

const FONT_FAMILY = 'Consolas, "Cascadia Code", Menlo, monospace';

export default function EditorPane({ activeFile, readOnly, onController, onSnapshotChange, onCursor }: Props) {
  const controllerRef = useRef<EditorController | null>(null);

  useEffect(
    () => () => {
      controllerRef.current?.dispose();
      onController(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      path={activeFile}
      defaultLanguage="python"
      defaultValue={SEED_FILES[activeFile]}
      keepCurrentModel
      loading={<div className="p-4 text-vsc-dim">Loading editor...</div>}
      options={{
        fontFamily: FONT_FAMILY,
        fontSize: 14,
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        glyphMargin: false,
        readOnly,
      }}
      onMount={(editor) => {
        controllerRef.current = createEditorController(monaco, editor, { onSnapshotChange });
        onController(controllerRef.current);
        editor.onDidChangeCursorPosition((e) => onCursor(e.position.lineNumber, e.position.column));
      }}
    />
  );
}
