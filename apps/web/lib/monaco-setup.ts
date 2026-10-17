"use client";

import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

// Load Monaco from the bundled package (no CDN) and give it its editor worker.
if (typeof window !== "undefined") {
  (self as unknown as { MonacoEnvironment: monaco.Environment }).MonacoEnvironment = {
    getWorker() {
      return new Worker(new URL("monaco-editor/editor/editor.worker", import.meta.url), {
        type: "module",
      });
    },
  };
  loader.config({ monaco });
}

export { monaco };
