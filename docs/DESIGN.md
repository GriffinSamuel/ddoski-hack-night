# Design: Face-Roast Editor

## Direction
A pixel-faithful VS Code "Dark+" clone: square corners, 13px UI text, blue status bar, Monaco `vs-dark`. The only non-VS-Code things on screen are the right column (camera, emotion meter, avatar stage) and the deletion overlay, so the eye goes there. Wow moment: the red wipe sweeps down the editor, then a big avatar dances over a glitching "DELETING" screen.

Present at browser zoom 150% on the 1920x1080 projector: that is exactly 1280x720 CSS px, which is the layout target (min 1280x720). Desktop only, dark only, no `dark:` variants, no reduced-motion rule (the animations ARE the demo).

Tailwind v4: tokens live in `@theme` inside `apps/web/app/globals.css`. Copy the block below into that file, replacing the starter `:root` / `prefers-color-scheme` rules. Needs `lucide-react` (not installed yet) for icons.

## Tokens

```css
@import "tailwindcss";

@theme {
  --color-vsc-editor: #1e1e1e;       /* editor bg, active tab */
  --color-vsc-sidebar: #252526;      /* explorer, right column panels */
  --color-vsc-activity: #333333;     /* activity bar */
  --color-vsc-tabbar: #2d2d2d;       /* tab bar, inactive tab */
  --color-vsc-titlebar: #3c3c3c;
  --color-vsc-border: #3e3e42;
  --color-vsc-text: #cccccc;
  --color-vsc-dim: #9d9d9d;          /* secondary TEXT (4.6:1+ everywhere) */
  --color-vsc-muted: #858585;        /* icons, line numbers, decoration only */
  --color-vsc-accent: #0e639c;       /* buttons */
  --color-vsc-accent-hover: #1177bb;
  --color-vsc-status: #007acc;       /* status bar, focus, selected border */
  --color-vsc-status-warn: #b5471f;  /* "Mode: profane" status item */
  --color-vsc-selection: #264f78;    /* selected chip bg */
  --color-vsc-hover: #2a2d2e;        /* list/chip hover */
  --color-vsc-list-active: #37373d;  /* selected explorer row */
  --color-emo-neutral: #858585;
  --color-emo-sad: #3794ff;
  --color-emo-happy: #3fb950;
  --color-emo-super: #f5a623;
  --color-vsc-danger: #f14c4c;
  --color-vsc-danger-bg: #3b0d0d;

  --font-sans: "Segoe UI", system-ui, -apple-system, sans-serif;
  --font-mono: Consolas, "Cascadia Code", Menlo, monospace;
  --text-ui: 13px;     --text-ui--line-height: 1.4;
  --text-small: 12px;  --text-small--line-height: 1.3;
  --text-code: 14px;   --text-code--line-height: 1.5;

  --spacing-titlebar: 30px;
  --spacing-activity: 48px;
  --spacing-explorer: 220px;
  --spacing-tab: 35px;
  --spacing-toolbar: 28px;
  --spacing-status: 22px;
  --spacing-rightcol: 320px;

  --radius-stage: 8px;   /* avatar stage, bubble only. Chrome uses rounded-none */
}

:root { color-scheme: dark; }
html, body { height: 100%; }
body {
  background: var(--color-vsc-editor); color: var(--color-vsc-text);
  font: 13px/1.4 var(--font-sans); min-width: 1280px; min-height: 720px;
  overflow: hidden; -webkit-font-smoothing: antialiased;
}
*:focus-visible { outline: 1px solid var(--color-vsc-status); outline-offset: -1px; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: #79797966; }
```

Utilities that result: `bg-vsc-editor`, `text-vsc-dim`, `border-vsc-border`, `bg-emo-sad`, `text-ui`, `text-small`, `text-code`, `font-mono`, `h-titlebar`, `w-activity`, `w-explorer`, `h-tab`, `h-toolbar`, `h-status`, `w-rightcol`, `rounded-stage`. Monaco: theme `"vs-dark"`, `fontFamily: 'Consolas, "Cascadia Code", Menlo, monospace'`, `fontSize: 14`, `automaticLayout: true`, `minimap: { enabled: true }`, `scrollBeyondLastLine: false`, `glyphMargin: false`.

Emotion colors: neutral grey `emo-neutral`, sad blue `emo-sad`, happy green `emo-happy`, super-happy orange `emo-super`. Danger red `vsc-danger` (overlay only).

## Color roles and contrast

| Foreground | Background | Ratio | Where |
| --- | --- | --- | --- |
| vsc-text #ccc | vsc-editor | 10.6 | body, editor chrome |
| vsc-text | vsc-sidebar | 9.7 | explorer, meter labels |
| vsc-text | vsc-titlebar | 6.9 | title bar |
| vsc-text | vsc-tabbar | 8.6 | inactive tab label |
| vsc-dim #9d9d9d | vsc-sidebar | 5.6 | EXPLORER header, hints |
| vsc-dim | vsc-tabbar | 5.1 | inactive tab, camera-unavailable |
| white | vsc-status #007acc | 4.6 | status bar |
| white | vsc-status-warn | 5.4 | "Mode: profane" |
| white | vsc-accent #0e639c | 6.4 | Undo button |
| white | vsc-selection | 8.5 | selected chip |
| #1e1e1e | white | 16 | speech bubble |
| vsc-danger | vsc-danger-bg / editor | 5.2+ | overlay title |
| vsc-muted (icons, bars only) | vsc-activity | 3.4 (3:1 for graphics) | inactive activity icons |

Rule: `vsc-muted` never carries text on sidebars (4.1:1); use `vsc-dim`.

## Layout primitives
Page: `flex h-screen flex-col` (no scroll). Middle row: `flex min-h-0 flex-1`. Editor column: `flex min-w-0 flex-1 flex-col`. Right column: `w-rightcol shrink-0 flex flex-col gap-2 overflow-y-auto border-l border-vsc-border bg-vsc-sidebar p-2`. Everything is `rounded-none` except the stage, bubble and chips.

## Components

### TitleBar
`h-titlebar shrink-0 flex items-center justify-center bg-vsc-titlebar text-small text-vsc-text select-none border-b border-vsc-border`. Text "Face-Roast Editor - Visual Studio Code". Optional (skip if short on time): left cosmetic menu words `File Edit Selection View Go Run Terminal Help` (`absolute left-3 flex gap-3`), right `Minus Square X` lucide icons 14px, each `w-[46px] h-full grid place-items-center`.

### ActivityBar
`w-activity shrink-0 flex flex-col items-center bg-vsc-activity pt-1`. Five buttons, `h-[48px] w-full grid place-items-center text-vsc-muted`, icon 24px, `aria-hidden`, no handler. Icons: `Files` (highlighted), `Search`, `GitBranch`, `Bug`, `Blocks`. Highlighted: `text-white border-l-2 border-white bg-white/5`.

### ExplorerSidebar
`w-explorer shrink-0 bg-vsc-sidebar border-r border-vsc-border flex flex-col`. Header `h-[35px] px-5 flex items-center text-[11px] tracking-wide uppercase text-vsc-dim` = "EXPLORER". Folder row `h-[22px] px-2 flex items-center gap-1 text-[11px] font-bold uppercase` with `ChevronDown` 16px, "ROAST-WORKSPACE". File row (button): `h-[22px] w-full pl-7 pr-2 flex items-center gap-2 text-ui text-vsc-text hover:bg-vsc-hover`, selected adds `bg-vsc-list-active text-white`. File icon `FileCode` 16px `text-emo-sad`. Click opens/activates the tab.

### TabBar + Tab
Bar: `h-tab shrink-0 flex bg-vsc-tabbar`. Tab (button): `h-tab px-3 flex items-center gap-2 text-ui border-r border-vsc-border`. Inactive: `bg-vsc-tabbar text-vsc-dim hover:text-vsc-text`. Active: `bg-vsc-editor text-white border-t border-t-vsc-status` (1px blue top line, no bottom border). Icon `FileCode` 16px; optional `X` 14px at the right, decorative. `role="tab"`, `aria-selected`.

### EditorToolbar
`h-toolbar shrink-0 flex items-center justify-between px-3 bg-vsc-editor border-b border-vsc-border`. Left: breadcrumb `text-small text-vsc-dim` "roast-workspace > bad_code.py". Right: Undo roast button, icon `Undo2` 14px:
- Enabled: `h-6 px-3 flex items-center gap-1.5 text-ui bg-vsc-accent text-white hover:bg-vsc-accent-hover rounded-none`
- Disabled (nothing to undo): add `opacity-40 cursor-not-allowed hover:bg-vsc-accent`, and set `disabled`.
Label "Undo roast".

### CameraTile
`relative h-[150px] shrink-0 overflow-hidden border border-vsc-border bg-black`. `<video class="h-full w-full object-cover -scale-x-100" muted playsInline autoPlay>`. Live badge: `absolute left-2 top-2 flex items-center gap-1.5 bg-black/60 px-1.5 py-0.5 text-[11px] text-white` with `<span class="size-2 rounded-full bg-vsc-danger animate-pulse">` + "LIVE".
Unavailable state: replace video with `h-full grid place-content-center justify-items-center gap-1 bg-vsc-sidebar border-dashed text-small text-vsc-dim`, `VideoOff` 24px, text "Camera unavailable", no LIVE badge.

### EmotionMeter
Panel: `shrink-0 border border-vsc-border bg-vsc-editor p-2 flex flex-col gap-1`.
- Top row: `flex items-baseline justify-between` with `text-small text-vsc-dim` "DETECTED" and the top label `text-[15px] font-bold uppercase` colored `text-emo-<top>` (neutral/sad/happy/super) plus its percent.
- Bar row x4 (neutral, sad, happy, super-happy): `grid grid-cols-[76px_1fr_36px] items-center gap-2 h-[18px] text-small`. Track `h-2 bg-vsc-tabbar border border-vsc-border`; fill `h-full bg-emo-<x> transition-[width] duration-150` with `style width: N%`. Value `text-right tabular-nums`. The top row's label gets `text-white font-semibold`.
- Hold bar: label row "HOLD" `text-small text-vsc-dim` (dimmed to `opacity-50` while neutral), track `h-1.5 bg-vsc-tabbar border border-vsc-border`, fill `h-full bg-emo-<held emotion>` width 0 to 100% over 1.5 s linear. Drive width from the hold timer (authoritative), no CSS transition; the `fr-hold` keyframe in the motion section is the CSS-only alternative (restart by changing `key`). Reset to 0 instantly when emotion changes or an edit fires.

### AvatarChip
Radiogroup of three: `grid grid-cols-3 gap-2`. Chip (button, `role="radio"`, `aria-checked`): `flex flex-col items-center gap-1 py-2 border border-vsc-border bg-vsc-editor text-small text-vsc-text rounded-[4px] hover:bg-vsc-hover`. Thumb: idle image `size-10 object-contain`, or fallback emoji `text-[28px] leading-none`. Selected: `border-vsc-status bg-vsc-selection text-white outline outline-1 outline-vsc-status`.

### AvatarStage
`relative flex-1 min-h-[240px] overflow-hidden border border-vsc-border bg-vsc-editor rounded-stage`; background accent `bg-[radial-gradient(circle_at_50%_75%,#264f78_0%,transparent_65%)]`. Avatar wrapper `.fr-avatar` (CSS in motion section) `absolute bottom-6 left-1/2 -ml-[90px] size-[180px]` with `data-state="idle|mean|smug|laughing"`; floor shadow `absolute bottom-4 left-1/2 -ml-12 h-3 w-24 rounded-full bg-black/50 blur-sm`. Inside: one or two `.fr-face` layers (see Motion). Each `.fr-face` is an `<img class="size-full object-contain" onError>` that swaps to the emoji fallback, or the fallback itself: character emoji `text-[110px] leading-none` centered plus state badge `absolute bottom-0 right-0 text-[44px]`. Hold non-idle state at least 3 s, then return to idle. Name label `absolute bottom-1 inset-x-0 text-center text-small text-vsc-dim`.

### SpeechBubble
Inside the stage, only when text exists: `fr-pop absolute left-3 right-3 top-3 z-10 rounded-stage bg-white px-3 py-2 text-[14px] font-semibold leading-snug text-vsc-editor line-clamp-4` with a tail: a child `<span class="absolute left-1/2 -bottom-1.5 size-3 -translate-x-1/2 rotate-45 bg-white">`. Do not put `line-clamp-4` on the same element as the tail (clamp sets overflow hidden); clamp an inner `<p>` instead. Text = the exact line written into the file, no leading `# `. `role="status"`. Overlay version: `max-w-[560px] text-[22px] px-5 py-3`, centered above the large avatar.

### StatusBar
`h-status shrink-0 flex items-center justify-between bg-vsc-status text-small text-white select-none`. Item: `h-full px-2.5 flex items-center gap-1.5 hover:bg-white/15`. Left: `Bot` 14px + avatar name, then `Smile` 14px + "sad" (current emotion, lowercase). Right, in order: AI/camera status text ("AI online" / "AI offline - using roast bank" / "Camera unavailable - manual mode" / "Detection paused"; when two apply show both as separate items, camera first), `Ln 3, Col 1`, `Python`, mode item. Mode item "Mode: profane" gets `bg-vsc-status-warn`; "Mode: clean" uses the default blue. The color flip on Alt+P is intentional, it is visible from the audience.

### DeletionOverlay
Mounted over the editor column's content area (tab bar and toolbar stay visible; it covers the Monaco box only) for exactly 3 s, then unmounts. Wrapper: `absolute inset-0 z-50 overflow-hidden fr-overlay cursor-wait select-none` (a `relative` parent around Monaco). It must swallow input: pointer events stay on (no `pointer-events-none`), the builder sets Monaco `readOnly: true` for the duration and ignores non-Alt keys in the window handler. Layers, bottom to top:
1. `fr-cover` (`absolute inset-0 bg-vsc-editor`): clip-path wipe from top to bottom, hides the code.
2. `fr-sweep` (`absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-vsc-danger/60 to-transparent`): leads the wipe.
3. `fr-glitch-bands`: three `absolute inset-x-0` bars (`h-3 top-[22%]`, `h-5 top-[51%]`, `h-2 top-[78%]`, `bg-vsc-danger/40`), jittering sideways.
4. Scanlines: `pointer-events-none absolute inset-0 opacity-50 [background:repeating-linear-gradient(0deg,transparent_0_3px,rgb(0_0_0/.35)_3px_4px)]`.
5. Content `absolute inset-0 grid place-content-center justify-items-center gap-4 text-center`: bubble (overlay size), large `.fr-avatar` 240px with `data-state="laughing"` (class `fr-avatar-in`), and a mono title `font-mono text-[28px] font-bold text-vsc-danger fr-glitch` "DELETING bad_code.py..." over a `text-code text-vsc-dim font-mono` line "$ rm -rf ./bad_code.py" (use the active file name).
Recommended: replace the buffer at the 2.0 s mark while covered; the 0.3 s fade-out then reveals the ASCII art.

### InsertedLineHighlight
Not a React component: a Monaco decoration `{ range, options: { isWholeLine: true, className: "fr-inserted-line" } }` on each inserted line; remove it after 1100 ms. CSS in the motion section (global, Monaco renders outside React).

## Screens

### / (demo steps 1-15, the only screen)
```
1280x720 min (150% zoom on 1920x1080)
+----------------------------------------------------------------------------+
| TitleBar h-titlebar 30  "Face-Roast Editor - Visual Studio Code"  bg-titlebar
+--+------------+----------------------------------------+-------------------+
|A | EXPLORER   | TabBar h-tab 35                        | CameraTile        |
|c | (w 220)    | [bad_code.py*][good_code.py]           |  h150 mirrored    |
|t | v ROAST-WS +----------------------------------------+  [LIVE]           |
|i |   bad_code | Toolbar h 28  crumbs      [Undo roast] +-------------------+
|v |   good_code+----------------------------------------+ EmotionMeter      |
|i |            | Monaco  vs-dark  14px mono             |  DETECTED  SAD 71%|
|t |            |  1  def find_dupes(items):             |  neutral  |==   9%|
|y |            |  2      ...                            |  sad      |=== 71%|
|  |            |  (flex-1, min 692px wide)              |  happy    |=    8%|
|w |            |                                        |  super    |     2%|
|4 |            | [DeletionOverlay covers this box only] |  HOLD [=====>   ] |
|8 |            |                                        +-------------------+
|  |            |                                        | AvatarChip x3     |
|  |            |                                        | [Labubu][Bear][Duck]
|  |            |                                        | AvatarStage (flex-1)
|  |            |                                        |  [SpeechBubble]   |
|  |            |                                        |     (avatar 180)  |
+--+------------+----------------------------------------+---------+---------+
| StatusBar h-status 22  bg-status                                  w-rightcol 320
| Bot Labubu | Smile sad        AI offline - using roast bank | Ln 3, Col 1 | Python | Mode: profane
+----------------------------------------------------------------------------+
```
Right column height at 720: 150 camera + ~130 meter + ~340 avatar block (chips ~64, stage fills the rest, min 240); it scrolls (`overflow-y-auto`) rather than squeezing if shorter.

Variants:
- Camera unavailable: CameraTile shows the dashed `VideoOff` state; meter bars sit at 0 (neutral 100% is wrong, show all 0); status bar shows "Camera unavailable - manual mode".
- Nothing to undo: Undo roast disabled.
- Edit applied: inserted lines flash (`fr-inserted-line`), avatar state `mean` (sad) or `smug` (happy) for 3 s with the bubble, Undo roast enabled.
- Super-happy: DeletionOverlay for 3 s per its timeline, avatar `laughing`, then ASCII art visible, Undo enabled.
- Broken avatar image: emoji fallback inside the same box, no layout shift.
Single screen, no stacking order below 1280 (not supported).

## Motion
All plain CSS in `globals.css`, after the `@theme` block.

| Name | Duration | Used for |
| --- | --- | --- |
| `fr-bob` | 2.4 s ease-in-out infinite | idle avatar, translateY 0 to -6px |
| `fr-dance` | 0.5 s ease-in-out infinite alternate | mean and laughing: rotate -8 to 8deg, translateY 0 to -14px |
| `fr-swap` | 1 s steps(1) infinite | mean face swap: layer A (mean) and B (idle, delay -0.5s) alternate every 0.5 s |
| `fr-smug` | 0.6 s ease-out forwards | smug pose: tilt -4deg, scale 1.06, translateY 4px, then hold |
| `fr-laugh` | 0.16 s linear infinite alternate | laughing: inner face shakes translateX +/-3px, rotate +/-3deg |
| `fr-pop` | 0.2 s ease-out | bubble appearing, scale .9 to 1 |
| `fr-inserted-line` | 1 s ease-out forwards | amber flash fading to transparent |
| `fr-hold` | 1.5 s linear forwards | hold-bar fill (alternative to timer-driven width) |
| `fr-overlay` | 3 s linear forwards | overlay life: opacity 0 to 1 by 7%, 1 until 90%, 0 at 100% |
| `fr-cover` | 1.4 s ease-in forwards | clip-path wipe `inset(0 0 100% 0)` to `inset(0)` |
| `fr-sweep` | 1.4 s ease-in forwards | red bar `top:-96px` to `top:100%` |
| `fr-glitch` | 0.25 s steps(2) infinite | overlay bands and title jitter, translateX +/-6px, hue shake |
| `fr-avatar-in` | 0.4 s ease-out both, delay 0.8 s | big avatar scale .5 to 1, opacity 0 to 1 |

Overlay timeline: 0-1.4 s wipe + sweep; 0.8 s avatar enters, dancing and laughing; 1.4-2.7 s full glitch with title; buffer replaced at 2.0 s; 2.7-3.0 s fade-out (`fr-overlay`); builder unmounts at 3000 ms.

```css
@keyframes fr-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
@keyframes fr-dance { from { transform: rotate(-8deg) translateY(0) } to { transform: rotate(8deg) translateY(-14px) } }
@keyframes fr-swap { 0%,49.99% { opacity: 1 } 50%,100% { opacity: 0 } }
@keyframes fr-smug { to { transform: rotate(-4deg) scale(1.06) translateY(4px) } }
@keyframes fr-laugh { from { transform: translateX(-3px) rotate(-3deg) } to { transform: translateX(3px) rotate(3deg) } }
@keyframes fr-pop { from { opacity: 0; transform: scale(.9) } to { opacity: 1; transform: scale(1) } }
@keyframes fr-line-flash { from { background-color: rgb(255 213 79 / .45); box-shadow: inset 3px 0 0 #f5a623 } to { background-color: transparent; box-shadow: inset 3px 0 0 transparent } }
@keyframes fr-hold { from { width: 0 } to { width: 100% } }
@keyframes fr-overlay-life { 0% { opacity: 0 } 7%,90% { opacity: 1 } 100% { opacity: 0 } }
@keyframes fr-cover { from { clip-path: inset(0 0 100% 0) } to { clip-path: inset(0 0 0 0) } }
@keyframes fr-sweep { from { top: -96px } to { top: 100% } }
@keyframes fr-glitch { 0% { transform: translateX(-6px); filter: hue-rotate(0deg) } 100% { transform: translateX(6px); filter: hue-rotate(40deg) } }
@keyframes fr-avatar-in { from { opacity: 0; transform: scale(.5) } to { opacity: 1; transform: scale(1) } }

.fr-avatar[data-state="idle"]     { animation: fr-bob 2.4s ease-in-out infinite }
.fr-avatar[data-state="mean"],
.fr-avatar[data-state="laughing"] { animation: fr-dance .5s ease-in-out infinite alternate }
.fr-avatar[data-state="smug"]     { animation: fr-smug .6s ease-out forwards }
.fr-avatar[data-state="laughing"] .fr-face { animation: fr-laugh .16s linear infinite alternate }
.fr-face { position: absolute; inset: 0 }
.fr-avatar[data-state="mean"] .fr-face--a { animation: fr-swap 1s steps(1) infinite }
.fr-avatar[data-state="mean"] .fr-face--b { animation: fr-swap 1s steps(1) infinite -.5s }
.fr-avatar:not([data-state="mean"]) .fr-face--b { display: none }
.fr-avatar-in { animation: fr-avatar-in .4s ease-out .8s both }
.fr-pop { animation: fr-pop .2s ease-out }
.fr-inserted-line { animation: fr-line-flash 1s ease-out forwards }
.fr-overlay { animation: fr-overlay-life 3s linear forwards }
.fr-cover { animation: fr-cover 1.4s ease-in forwards }
.fr-sweep { animation: fr-sweep 1.4s ease-in forwards }
.fr-glitch { animation: fr-glitch .25s steps(2) infinite }
```
`.fr-inserted-line` must live in global CSS (Monaco DOM is outside React). `.fr-face--a` is the current-state face, `.fr-face--b` the idle face (rendered only in `mean`).

## Avatar images
Files: `apps/web/public/avatars/<id>-<state>.png`, ids `labubu`, `calhacks-bear`, `rubber-duck`; states `idle`, `mean`, `smug`, `laughing`. 512x512 PNG, transparent background, subject centered with about 8% margin, front facing, under 300 KB. Displayed at 40px (chip), 180px (stage), 240px (overlay) with `object-contain`. P0 needs only the three `-idle.png`; the others are P1. Do not copy idle into missing states (the swap would look frozen); let the config omit them so the emoji fallback shows. Missing or `onError` falls back per layer, no broken-image icon.

Emoji fallback: character emoji (stage 110px, chip 28px) plus a state badge (stage 44px corner). Char: Labubu 🧌, CalHacks Bear 🐻, Rubber Duck 🦆. Badge per state, same for all: idle 😐, mean 😈, smug 😏, laughing 🤣. In `mean`, layer A shows char+😈 and layer B char+😐.

## Accessibility minimums
- Contrast table above holds; secondary text uses `vsc-dim`, never `vsc-muted`.
- Global `:focus-visible` outline (VS Code style 1px blue inset) on all buttons.
- Every button is a real `<button>`; icon-only controls get `aria-label`. Decorative chrome (activity bar, title bar) is `aria-hidden`.
- Avatar chips `role="radio"` in a `role="radiogroup"` with `aria-label="Avatar"`; tabs `role="tab"`; bubble `role="status"`.
- Hotkeys are hidden by design and intentionally not shown in the UI.
