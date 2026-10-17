"use client";

/** Runs Python in the browser with Pyodide (CPython on WebAssembly). Loaded lazily on first use. */

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface PyodideLike {
  runPythonAsync(code: string): Promise<unknown>;
  setStdout(opts: { batched: (text: string) => void }): void;
  setStderr(opts: { batched: (text: string) => void }): void;
}

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideLike>;
  }
}

let pyodidePromise: Promise<PyodideLike> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(el);
  });
}

async function getPyodide(): Promise<PyodideLike> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      if (!window.loadPyodide) await loadScript(`${PYODIDE_URL}pyodide.js`);
      if (!window.loadPyodide) throw new Error("Pyodide did not initialise");
      return window.loadPyodide({ indexURL: PYODIDE_URL });
    })();
    pyodidePromise.catch(() => {
      pyodidePromise = null; // allow a retry after a failed download
    });
  }
  return pyodidePromise;
}

export interface RunResult {
  output: string;
  error: string | null;
  ms: number;
}

/** Execute `code` and capture everything it prints. Never throws. */
export async function runPython(code: string): Promise<RunResult> {
  const started = performance.now();
  const chunks: string[] = [];
  try {
    const py = await getPyodide();
    py.setStdout({ batched: (t) => chunks.push(t) });
    py.setStderr({ batched: (t) => chunks.push(t) });
    await py.runPythonAsync(code);
    return { output: chunks.join("\n"), error: null, ms: performance.now() - started };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { output: chunks.join("\n"), error: message, ms: performance.now() - started };
  }
}
