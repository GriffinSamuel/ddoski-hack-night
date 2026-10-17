"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityBar } from "@/components/ActivityBar";
import { AvatarChips } from "@/components/AvatarChips";
import { AvatarStage } from "@/components/AvatarStage";
import { CameraTile } from "@/components/CameraTile";
import { DeletionOverlay } from "@/components/DeletionOverlay";
import { EditorToolbar } from "@/components/EditorToolbar";
import { EmotionMeter } from "@/components/EmotionMeter";
import { ExplorerSidebar } from "@/components/ExplorerSidebar";
import { StatusBar } from "@/components/StatusBar";
import { TabBar } from "@/components/TabBar";
import { TitleBar } from "@/components/TitleBar";
import { useEmotionDetector } from "@/hooks/useEmotionDetector";
import { useHotkeys } from "@/hooks/useHotkeys";
import { ApiError, createRoast, getHealth } from "@/lib/api";
import { getAvatar } from "@/lib/avatars";
import type { EditorController } from "@/lib/editor-controller";
import { getReplacement, getRoastBlock, MAX_ROAST_LINES } from "@/lib/roast-bank";
import { SEED_FILES } from "@/lib/seed-files";
import type { AiStatus, AvatarId, AvatarState, Emotion, FileName, RoastEmotion, RoastMode } from "@/lib/types";

const EditorPane = dynamic(() => import("@/components/EditorPane"), {
  ssr: false,
  loading: () => <div className="p-4 text-vsc-dim">Loading editor...</div>,
});

/** Master switches so a P1 piece can be turned off without touching the rest. */
const ENABLE_AI = true;
const ENABLE_DELETION_OVERLAY = true;

const OVERLAY_MS = 4500;
const OVERLAY_SWAP_MS = 3000;
const REACTION_MS = 3200;

const STATE_FOR: Record<RoastEmotion, AvatarState> = {
  sad: "mean",
  happy: "smug",
  "super-happy": "laughing",
};

interface Replacement {
  mock: string[];
  art: string[];
}

export function FaceRoastApp() {
  const [activeFile, setActiveFile] = useState<FileName>("bad_code.py");
  const [avatarId, setAvatarId] = useState<AvatarId>("labubu");
  const [mode, setMode] = useState<RoastMode>("profane");
  const [detectionOn, setDetectionOn] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [bubble, setBubble] = useState<string | null>(null);
  const [shownEmotion, setShownEmotion] = useState<Emotion | null>(null);
  const [overlayFile, setOverlayFile] = useState<FileName | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus>("unknown");
  const [cursor, setCursor] = useState({ line: 1, column: 1 });

  const controllerRef = useRef<EditorController | null>(null);
  const recentRoastsRef = useRef<Set<string>>(new Set());
  const aiBlockedRef = useRef(!ENABLE_AI);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const live = useRef({ activeFile, avatarId, mode });
  useEffect(() => {
    live.current = { activeFile, avatarId, mode };
  });

  const avatar = getAvatar(avatarId);

  // One non-blocking health check on load.
  useEffect(() => {
    if (!ENABLE_AI) return;
    getHealth()
      .then((h) => {
        if (h.ai_configured === false) {
          aiBlockedRef.current = true;
          setAiStatus("offline");
        } else {
          setAiStatus(h.ai_configured === true ? "online" : "unknown");
        }
      })
      .catch(() => setAiStatus("offline"));
  }, []);

  const react = useCallback((emotion: RoastEmotion, holdMs: number) => {
    clearTimeout(reactionTimerRef.current);
    setAvatarState(STATE_FOR[emotion]);
    setShownEmotion(emotion);
    reactionTimerRef.current = setTimeout(() => {
      setAvatarState("idle");
      setBubble(null);
      setShownEmotion(null);
    }, holdMs);
  }, []);

  /** Ask the backend; resolves null on any failure (caller uses the bank). */
  const askAi = useCallback(async (file: FileName, emotion: RoastEmotion) => {
    const controller = controllerRef.current;
    if (aiBlockedRef.current || !controller) return null;
    try {
      const res = await createRoast({
        code: controller.getCode(file),
        file_name: file,
        emotion,
        avatar: live.current.avatarId,
        mode: live.current.mode,
      });
      setAiStatus("online");
      return res;
    } catch (e) {
      setAiStatus("offline");
      if (e instanceof ApiError && e.code === "ai_unavailable") aiBlockedRef.current = true;
      return null;
    }
  }, []);

  const applyLines = useCallback(
    async (file: FileName, emotion: "sad" | "happy") => {
      const { avatarId: a, mode: m } = live.current;
      const ai = await askAi(file, emotion);
      const controller = controllerRef.current;
      if (!controller) return;
      // Never insert a line that is already in the file or was roasted recently; cap at MAX_ROAST_LINES.
      const existing = controller.getCode(file).toLowerCase();
      const fresh = (candidates: string[]) =>
        candidates
          .map((l) => l.trim())
          .filter((l, i, arr) => l && arr.indexOf(l) === i)
          .filter((l) => !existing.includes(l.toLowerCase()) && !recentRoastsRef.current.has(l.toLowerCase()))
          .slice(0, MAX_ROAST_LINES);
      const remember = (lines: string[]) => {
        lines.forEach((l) => recentRoastsRef.current.add(l.toLowerCase()));
        if (recentRoastsRef.current.size > 40) recentRoastsRef.current.clear();
      };
      if (ai && ai.kind === "lines") {
        const lines = fresh(ai.lines.map((l) => l.text));
        const atLine = ai.lines.find((l) => l.line !== null)?.line ?? null;
        if (lines.length > 0) {
          remember(lines);
          controller.insertComments(file, lines, atLine);
          setBubble(lines[0]);
          return;
        }
      }
      let lines = fresh(getRoastBlock(a, emotion, m));
      if (lines.length === 0) lines = fresh(getRoastBlock(a, emotion, m));
      if (lines.length === 0) lines = getRoastBlock(a, emotion, m).slice(0, 1);
      remember(lines);
      controller.insertComments(file, lines, null);
      setBubble(lines[0]);
    },
    [askAi],
  );

  const applyReplacement = useCallback(
    async (file: FileName) => {
      const { avatarId: a, mode: m } = live.current;
      const bank = getReplacement(a, m);
      let chosen: Replacement = bank;
      setBubble(bank.mock[0]);
      if (ENABLE_DELETION_OVERLAY) setOverlayFile(file);
      const aiPromise = askAi(file, "super-happy");
      // Wait for the AI only until the swap moment; otherwise the bank is used.
      const ai = ENABLE_DELETION_OVERLAY
        ? await Promise.race([aiPromise, new Promise<null>((r) => setTimeout(() => r(null), OVERLAY_SWAP_MS))])
        : await aiPromise;
      if (ai && ai.kind === "replacement") {
        chosen = { mock: ai.mock_lines, art: ai.art_lines };
        setBubble(ai.mock_lines[0]);
      }
      controllerRef.current?.replaceWithComments(file, [...chosen.mock, ...chosen.art]);
      if (ENABLE_DELETION_OVERLAY) setTimeout(() => setOverlayFile(null), OVERLAY_MS - OVERLAY_SWAP_MS);
    },
    [askAi],
  );

  const detector = useEmotionDetector({
    enabled: detectionOn,
    onFire: (emotion) => trigger(emotion),
  });
  const { markFired } = detector;

  function trigger(emotion: Emotion) {
    if (overlayFile !== null) return;
    if (emotion === "neutral") {
      clearTimeout(reactionTimerRef.current);
      setAvatarState("idle");
      setBubble(null);
      setShownEmotion("neutral");
      return;
    }
    markFired();
    const file = live.current.activeFile;
    setBubble(null);
    if (emotion === "super-happy") {
      react(emotion, OVERLAY_MS + REACTION_MS);
      void applyReplacement(file);
    } else {
      react(emotion, REACTION_MS + 1500);
      void applyLines(file, emotion);
    }
  }

  useHotkeys({
    onForce: trigger,
    onToggleDetection: () => setDetectionOn((on) => !on),
    onToggleMode: () => setMode((m) => (m === "profane" ? "clean" : "profane")),
    locked: overlayFile !== null,
  });

  const undo = () => {
    const restored = controllerRef.current?.undoRoast();
    if (restored) setActiveFile(restored);
  };

  /** Back to the opening state: seed files, idle avatar, no bubble, bad_code.py active. */
  const reset = () => {
    clearTimeout(reactionTimerRef.current);
    setOverlayFile(null);
    controllerRef.current?.resetAll(SEED_FILES);
    setAvatarState("idle");
    setBubble(null);
    setShownEmotion(null);
    setActiveFile("bad_code.py");
    markFired();
  };

  const displayEmotion: Emotion = shownEmotion ?? detector.top;

  return (
    <div className="flex h-screen flex-col">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <ActivityBar />
        <ExplorerSidebar activeFile={activeFile} onOpen={setActiveFile} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TabBar activeFile={activeFile} onSelect={setActiveFile} />
          <EditorToolbar activeFile={activeFile} canUndo={canUndo} onUndo={undo} onReset={reset} />
          <div className="relative min-h-0 flex-1">
            <EditorPane
              activeFile={activeFile}
              readOnly={overlayFile !== null}
              onController={(c) => {
                controllerRef.current = c;
              }}
              onSnapshotChange={setCanUndo}
              onCursor={(line, column) => setCursor({ line, column })}
            />
            {overlayFile && <DeletionOverlay avatar={avatar} fileName={overlayFile} bubble={bubble} />}
          </div>
        </div>
        <aside className="w-rightcol shrink-0 flex flex-col gap-2 overflow-y-auto border-l border-vsc-border bg-vsc-sidebar p-2">
          <CameraTile videoRef={detector.videoRef} status={detector.cameraStatus} />
          <EmotionMeter scores={detector.scores} top={detector.top} hold={detector.hold} holding={detector.holding} />
          <AvatarChips selected={avatarId} onSelect={setAvatarId} />
          <AvatarStage avatar={avatar} state={avatarState} bubble={bubble} />
        </aside>
      </div>
      <StatusBar
        avatarName={avatar.name}
        emotion={displayEmotion}
        cameraStatus={detector.cameraStatus}
        detectionOn={detectionOn}
        aiStatus={aiStatus}
        mode={mode}
        line={cursor.line}
        column={cursor.column}
      />
    </div>
  );
}
