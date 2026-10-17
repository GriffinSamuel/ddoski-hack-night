# Spec: Face-Roast Editor

## Product statement
A webcam reads your mood and a meme avatar punishes your code: sad gets roasted, too happy gets deleted. Face-Roast Editor is a single-page, VS Code-style editor (Monaco, dark theme, activity bar, tabs, status bar) for hackathon attendees who like dev memes; it is not a real VS Code extension and is pitched on stage as a "VS Code-style editor". An in-browser emotion model watches the webcam (frames never leave the browser) and edits the open file by mood: sad inserts insulting comments, happy inserts condescending "improve this" comments, super-happy deletes the code and leaves a mocking comment plus ASCII art. The lean-forward moment is a visibly delighted face making the whole file vanish while the chosen avatar dances and mocks you.

Judge pitch (one sentence): A webcam reads your mood and a meme avatar punishes your code: sad gets roasted, too happy gets deleted.

Time limit: under 1 hour of build. Feature freeze 7:40 PM, submit by 8:05 PM, due 8:15 PM. No login, no Supabase use, no database.

## Features

Rule that applies to every feature: the P0 path works with the backend completely off and Ollama not running. The pre-written roast bank lives in the frontend. The backend only enhances (F4).

### F1: Emotion drives edits to the open file (P0)
Given the app is open, the webcam is allowed, and a seeded file is open in the editor
When the user holds a sad, happy, or super-happy face for 1.5 seconds continuously (the live meter shows the hold progress)
Then the emotion's edit from the Emotion table is applied to the in-memory editor buffer and the live emotion meter and status bar show the detected emotion label.
Given a sad, happy, or super-happy edit was just applied
When the user clicks "Undo roast" (a visible button in the editor toolbar) or presses Ctrl+Z in the editor
Then the buffer returns to exactly its content before that edit.
Given an edit has just fired
When the same emotion is still held
Then no further edit fires until a cooldown of 6 seconds has passed and the emotion has been held again for 1.5 seconds.
Given the camera is denied or the model fails to load
When the page loads
Then the status bar reads "Camera unavailable - manual mode", no error page appears, and the hotkeys below still drive every behavior.
Done when: in the demo, a detected (or hotkey-forced) emotion visibly edits the open file, and undo restores it.

### F2: Pick an avatar; it reacts and its voice flavors the comments (P0)
Given the app is open
When the user clicks one of the three avatar choices in the avatar panel ("Labubu", "CalHacks Bear", "Rubber Duck")
Then that avatar is shown in the panel with a highlighted selected state and the status bar shows its name.
Given an avatar is selected and an emotion edit fires
When the edit is applied
Then the avatar panel changes to that emotion's animation (see Emotion table) for at least 3 seconds and shows a speech bubble with the same line that was written into the file as a comment.
Given a different avatar is then selected and the same emotion fires
When the edit is applied
Then the comment text comes from the bank for that avatar and differs from the first avatar's bank.
Given the avatar images for Labubu, CalHacks Bear, and Rubber Duck exist under apps/web/public/avatars/
When an avatar is shown in the panel or on the stage
Then its image is shown for the idle state (P0), and per-state images for dancing/mean, smug, and laughing are shown when present (P1).
Given an avatar image file is missing or fails to load
When that avatar is shown in that state
Then the emoji/CSS face for that state is shown instead, with no broken-image icon and no error.
Done when: the chosen character and the inserted comments both visibly react in the demo, switching avatar changes the voice, and a broken image never breaks the avatar panel.

### F3: VS Code-style shell, seeded files, and demo-safety controls (P0)
Given the app is open
When the page finishes loading
Then the screen shows a Monaco editor with the VS Code dark theme, an activity bar on the left, a tab bar with two tabs ("bad_code.py" and "good_code.py"), a status bar at the bottom, a camera tile with a live emotion meter, and the avatar panel (regions defined in Screen).
Given the app is open
When the user presses Alt+2, Alt+3, or Alt+4 (or Alt+1) anywhere on the page, including while the editor has focus
Then the sad, happy, super-happy (or neutral) emotion is forced immediately with no hold time and the same edit and avatar reaction as a detected emotion occurs.
Given the user clicks the "good_code.py" tab then clicks the "bad_code.py" tab
When each tab is shown
Then each shows its own seeded Python content, and an edit applies only to the currently active tab's buffer.
Given the app is in profane mode (the default on load) and the status bar reads "Mode: profane"
When the user presses Alt+P and then forces sad with Alt+2
Then the inserted comment contains no cursing and the status bar reads "Mode: clean".
Given any edit has happened
When the page is reloaded
Then both files are back to their original seeded content (no persistence, nothing written to disk).
Done when: the screen reads as VS Code from across a room, hotkeys (including the Alt+P roast-mode toggle) work with editor focus, and no edit touches anything outside the in-memory buffers.

### F4: AI-generated, code-specific roasts and ASCII art (P1)
Given the backend is running, Ollama is reachable with the model (qwen2.5-coder:7b) loaded, and "bad_code.py" is open
When a sad edit fires
Then within 7 seconds the inserted comments reference something specific in that file (a variable, function, or pattern by name) instead of a bank line.
Given the same setup and the current roast mode is clean
When a sad edit fires
Then the request carries the mode (profane or clean) and the inserted comments contain no cursing; in profane mode only mild cursing aimed at the code and the user's skill appears, and the Content rule holds in both modes.
Given the same setup and "good_code.py" is open
When a happy edit fires
Then the inserted comments are condescending about a specific line or pattern in the file, and when a super-happy edit fires the replacement ASCII art is generated rather than taken from the bank.
Given the backend is down, Ollama is unreachable or the model is not loaded, or the call takes longer than 7 seconds or returns an error
When any edit fires
Then the bank roast is used with no visible error or delay beyond 7 seconds, and the status bar shows "AI offline - using roast bank".
Given the backend starts
When it boots
Then it warms the model once (a throwaway generation) so the first demo request does not pay the cold-load time (about 50 s measured).
Given the backend returned text
When it is inserted
Then it is inserted only as comment lines (or ASCII art inside comment lines), never as executable code.
Done when: with Ollama reachable, a roast names something real from the file; with Ollama absent, F1 and F2 behave identically to the bank path.

### F5: Meme-style deletion animation (P1)
Given a super-happy edit fires (detected or hotkey)
When the deletion starts
Then a full-editor overlay plays for about 3 seconds in which the code visibly vanishes (lines wipe/glitch out) and the avatar is shown large dancing and mocking, with a speech bubble.
Given the overlay is playing
When the user clicks or presses keys
Then the overlay does not dismiss until it ends ("unskippable"), after which the ASCII art and mocking comment are visible in the editor.
Given the animation just ended
When the user clicks "Undo roast"
Then the original code returns.
Done when: the deletion moment has a visible animated build-up rather than an instant swap.

### Screen (single page, desktop only)
Regions, left to right and top to bottom:
- Title bar strip: static text "Face-Roast Editor - Visual Studio Code" (cosmetic).
- Activity bar (far left): 4 to 5 static VS Code-style icons. One is highlighted. Clicking does nothing. Cosmetic.
- Explorer sidebar (narrow, left): lists the two seeded files; clicking a file opens its tab. Static header "EXPLORER".
- Tab bar: "bad_code.py", "good_code.py"; active tab styled like VS Code.
- Editor (center, largest): Monaco, Python language, VS Code dark theme, line numbers. Toolbar above or beside it with one "Undo roast" button (disabled when there is nothing to undo).
- Right column, top: camera tile (mirrored live webcam, small) with the emotion meter directly under it: one labelled bar each for neutral, sad, happy, super-happy (0 to 100%), the current top label, and a hold-progress bar that fills over 1.5 s while a non-neutral emotion is held.
- Right column, bottom: avatar panel with the three avatar choices as selectable chips/cards, and the large avatar stage below showing the selected avatar with its animation and speech bubble.
- Status bar (bottom, VS Code blue): left side shows avatar name and current emotion; right side shows "Ln, Col", "Python", the roast mode text ("Mode: profane" or "Mode: clean", default "Mode: profane"), and the AI/camera status text ("AI offline - using roast bank", "Camera unavailable - manual mode", or "AI online").
- Camera permission is requested on load. No settings page, no login screen.

### Comment and roast insertion behavior
- Comment syntax is Python (`# `). Every inserted line starts with `# `.
- Sad and happy: the roast block (2 to 4 comment lines) is inserted above the line the cursor is on, or above line 1 if the editor has never been focused. Existing code is left intact and never modified.
- AI-generated (F4) roasts are inserted above the specific line they reference when the response says which line; otherwise at the cursor rule above.
- Insertion uses a Monaco edit operation so Ctrl+Z works, and the edit also pushes the pre-edit text onto a one-level undo snapshot for the "Undo roast" button.
- Inserted comment lines are briefly highlighted (about 1 second) so the audience sees what was added.

### Delete and ASCII art behavior
- Super-happy replaces the entire content of the active tab's buffer with: one mocking comment block (2 to 3 lines, in the avatar's voice) followed by ASCII art inside `# ` comment lines, at most 20 lines tall and 60 characters wide. The art is chosen from the bank (at least 3 pieces, e.g. skull, tombstone "RIP YOUR CODE", middle-finger-free taunting face) or generated by the AI (F4).
- The deletion acts only on the in-memory Monaco buffer. Nothing is written to disk or a server.
- Undo: the "Undo roast" button and Ctrl+Z both restore the pre-delete code.

### Hotkeys (hidden: not shown in the UI)
- Alt+1: force neutral
- Alt+2: force sad
- Alt+3: force happy
- Alt+4: force super-happy
- Alt+0: toggle camera-driven detection off/on (while off, only hotkeys act; status bar shows "Detection paused")
- Alt+P: toggle roast mode between profane and clean (default on load: profane). Window-level like the others, works with Monaco focused. Affects the next edit; already inserted text is unchanged. Status bar shows "Mode: profane" or "Mode: clean".
- Hotkeys are captured at window level so they work with Monaco focused, and they ignore the 1.5 s hold but still respect nothing else (no cooldown for forced emotions, so the presenter can chain them).

### Emotion states and behavior
The model must produce four states: neutral, sad, happy, super-happy. Builders choose face-api.js or MediaPipe Face Landmarker. Suggested mapping from model output: sad = frown or down-turned mouth corners above threshold; happy = moderate smile; super-happy = wide smile with open mouth or squinted cheeks above a higher threshold; neutral = none of the above. All thresholds live in one constants file so they can be tuned in venue light. Detected emotion must update the meter at 5 frames per second or better.

| Emotion | Avatar | Written into the code | Code deleted? |
| --- | --- | --- | --- |
| neutral | Idle bob, neutral face, no bubble | Nothing | No |
| sad | Dances and pulls mean faces (face swaps every ~0.5 s), bubble shows the insult | 2 to 4 insulting comment lines aimed at the code and the user's skill; mild cursing in profane mode, none in clean mode | No |
| happy | Smug, arms-crossed style pose, condescending bubble | 2 to 4 condescending comments on how to improve the code ("could be better, try X") | No |
| super-happy | Large, dancing, laughing at the user, overlay per F5 | One mocking comment block plus ASCII art replacing everything | Yes, entire active buffer (undoable) |

### Content rule
There are two roast modes, "profane" (default) and "clean" (toggled with Alt+P). In profane mode mild cursing is allowed ("dumbass", "damn", "shit code"), aimed only at the code and the user's coding skill. In clean mode there is no cursing at all; it is the same jokes reworded. The rest of this rule applies to both modes. No slurs. Nothing about race, gender, sexuality, religion, disability, nationality, or any protected group. No threats, no self-harm references, no comments about the user's appearance. This applies to the bank and to the AI system prompt.

### Roast bank (P0 content, frontend static data)
- Per avatar (3) per emotion (sad, happy, super-happy) per mode (profane, clean): at least 5 lines for sad, 5 for happy, 3 for super-happy in EACH mode, each written in that avatar's voice. Every profane line has a clean variant (same joke, no cursing), so the two modes have equal line counts. Clean lines contain no cursing. Lines are comment-ready (no leading `# `, added on insertion).
- At least 3 shared ASCII art pieces for the super-happy replacement. The art contains no text profanity, so it is shared by both modes; only the mocking comment block differs by mode.
- Selection: random but never the same line twice in a row for the same avatar, emotion, and mode.
- Avatars are defined by a single config: id, display name, an emoji or CSS/ASCII face per state (idle, mean/dancing, smug, laughing), and an image URL per state. Named slots: "Labubu", "CalHacks Bear", "Rubber Duck".
- Images: nextjs-developer downloads an image for each of the three avatars into apps/web/public/avatars/ and references them through the per-state image URL in the avatar config. An idle-state image per avatar is expected in P0; images for the other states are P1. The emoji/CSS face is mandatory and is the fallback whenever an image is absent or fails to load. Behavior is identical either way.

## Cut list
- Real VS Code extension: outside the pipeline and 1-hour limit; pitched as "VS Code-style editor". Deferred post-event.
- Login, accounts, Supabase tables, auth-integration-engineer: brief says no login; nothing is persisted.
- Saving or loading user files, file upload, real file system: edits are in-memory only, by safety rule.
- Real code execution or correctness checking: "wrong code" is a seeded file; nothing runs the code.
- Multiple languages: Python only.
- Voice or text-to-speech roasts: no time; speech bubbles only.
- More than 3 avatars, custom avatar upload: exceeds scope.
- Streaming AI responses, multi-step AI calls: single request per edit.
- Roast history, settings page, search, pagination, profile, analytics: not on the demo path.
- Mobile layout, light theme, i18n: desktop dark only.
- Functional VS Code chrome (working activity bar, command palette, terminal, extensions panel): cosmetic only.
- Server-side webcam processing or uploading frames: privacy and latency; the model runs in the browser.
- Real-time sync, payments, email, admin dashboard: not applicable.
- Emotion states beyond the four named ones (angry, surprised): no time to tune.
- Backend tests beyond health and roast fallback: verify phase covers the P0 path only.

## Data model
No database, no Supabase tables, no user entity, no Realtime. Nothing is persisted; reload resets everything.

Client-side state (not tables):
- avatar: static config of three characters (id, display name, emoji/CSS faces per state, image URL per state). Selected avatar id is held in memory.
- roast mode: profane or clean, held in memory, default profane.
- roast bank: static data keyed by avatar, emotion (sad, happy, super-happy), and mode (profane, clean), plus shared ASCII art pieces.
- file: two seeded Python files with name and content. Active tab and live buffer are held in the Monaco model.
- emotion reading: current scores for neutral, sad, happy, super-happy, the current top label, hold timer, and cooldown timer.
- undo snapshot: the active file's content before the most recent edit.

Seeded files:
- bad_code.py: about 12 to 18 lines with an obviously wrong or wasteful pattern, for example a duplicate-finder using nested loops with an off-by-one error and an unused variable, with a function name worth mocking. Must contain at least one named function and one named variable for F4 to reference.
- good_code.py: about 10 to 15 lines of clean, correct, idiomatic Python (for example a function that returns unique items in order using a set, with a docstring). Must also contain named identifiers.

Backend capabilities required (api-designer writes the contract; no endpoint paths or schemas here):
- Health check (already exists).
- Roast generation: given the current code, the emotion (sad or happy), the avatar, the mode (profane|clean), and optionally the file name, return a short list of comment-ready roast lines and, if possible, the line number each refers to. Must enforce the Content rule. Must fail fast with a clear error when Ollama is unreachable or the model is not loaded so the client falls back to the bank within its 7-second limit. On boot the backend warms the model once.
- Replacement generation for super-happy: given the code, the avatar, and the mode (profane|clean), return a mocking comment block plus ASCII art within the size limit. May be the same capability as roast generation with a different emotion value; api-designer decides.
- Both capabilities are optional at runtime: the frontend never blocks on them.
- The AI is a local Ollama model (qwen2.5-coder:7b) on the demo laptop; a warm call takes about 4 s (measured), and the backend runs locally next to it, so no deployment change is needed.

## Demo script
Presenter pre-opens the app in the venue browser, camera already allowed, "bad_code.py" active, Labubu selected. Rehearse once in venue light.
1. [0:00] / (editor). Say: "This is a VS Code-style editor that reads your face." Point at the camera tile and live emotion meter bars moving. About 10 s.
2. [0:10] Avatar panel. Click "CalHacks Bear", then click back to "Labubu". Selected state and status-bar name change. About 8 s.
3. [0:18] Editor, "bad_code.py". Point at the nested-loop code: "This is wrong and slow." Click into the editor on the function line. About 10 s.
4. [0:28] Make a sad face and hold. The hold bar fills over 1.5 s. About 8 s. (Fallback: press Alt+2 if the meter does not reach sad within 5 s.)
5. [0:36] Lean-forward 1: insulting comments appear above the cursor line and highlight; Labubu dances and pulls mean faces with the same line in a speech bubble. Read one aloud. About 15 s.
6. [0:51] Click "Undo roast" so the code returns clean. Click the "good_code.py" tab: "Now correct code." About 8 s.
7. [0:59] Smile moderately. Condescending "could be better" comments appear and Labubu looks smug. About 15 s. (Fallback: Alt+3.)
8. [1:14] Say "And if you are too happy about it..." then grin wide and hold. About 8 s. (Fallback: Alt+4. Biggest demo risk is the detector misfiring in venue light; the hotkey and the visible meter are the mitigation, and the deletion is in-memory with undo.)
9. [1:22] Lean-forward 2, the wow moment: the F5 overlay plays about 3 s, the code wipes out, the large Labubu dances and mocks. Then the mocking comment and ASCII art are in the file. About 15 s.
10. [1:37] Hold on the result, read the mocking comment aloud. About 10 s.
11. [1:47] Click "Undo roast"; the original good code returns. "Nothing touched your disk." About 10 s.
12. [1:57] Switch to "CalHacks Bear" and press Alt+2 on "bad_code.py": a different voice roasts the same code. About 15 s.
13. [2:12] Press Alt+P (status bar flips to "Mode: clean"), then press Alt+2 again: the clean version of the roast appears. Say "works for the judges with kids". About 15 s.
14. [2:27] If the status bar shows "AI online", point at it and the roast that names a real variable from the file ("it knows your code"). If not, skip. About 15 s.
15. [2:42] Wrap with the pitch: "A webcam reads your mood and a meme avatar punishes your code: sad gets roasted, too happy gets deleted." About 13 s. Ends at 2:55.

Steps 1 to 13 use only F1, F2, F3, F5 (P0 and P1 without the API). Step 14 is optional (needs F4); step 5 and 9 work with the bank alone. Presenter starts in profane mode (the default).

## Time budget
| Phase | Minutes | Ends by | Owner agents |
| --- | --- | --- | --- |
| Scope (this doc, design) | 10 | start+10 | product-manager, ui-designer |
| Contract | 5 | start+15 | api-designer |
| Build P0 (F1, F2, F3) | 25 | start+40 | nextjs-developer, fastapi-developer (roast endpoint stub), prompt-engineer later |
| Build P1 (F4, F5) | 10 | feature freeze 7:40 PM | nextjs-developer, fastapi-developer, prompt-engineer |
| Verify and fix | 15 | 7:55 PM | test-automator, surgeon-reviewer, debugger |
| Ship and rehearse | 10 | submit by 8:05 PM | readme-generator, landing-page-copywriter |
| Buffer | 10 | due 8:15 PM | none |

Cut rule: If F1 and F2 and F3 are not demoable by about start+40, F5 and F4 move to the cut list. If F5 is not done by 7:30 PM, it moves to the cut list and the super-happy edit is an instant replacement with the avatar dancing. If F4 is not done by 7:30 PM, it moves to the cut list and the bank stays the only path. Never cut the hotkeys or undo.

Parallel build split (ownership per CLAUDE.md): nextjs-developer builds the whole screen and the client-side model; fastapi-developer builds the roast and replacement generation with the Ollama-unreachable fast failure and the boot-time warm-up; prompt-engineer writes the AI prompt after the backend exists; auth-integration-engineer is skipped.

## Assumptions
- "Start" in the time budget is the moment phase 3 builders are launched; wall-clock anchors are the freeze 7:40 PM, submit 8:05 PM, due 8:15 PM from docs/BRIEF.md.
- The roast bank and the emotion model run entirely in the frontend, so F1 to F3 work with the backend off and Ollama not running.
- The emotion model files are served from the app itself (public folder) if that is quick; if the builder uses a CDN, it needs venue wifi, so the hotkeys are the fallback.
- Python is the only editor language; comment prefix is `# `.
- Three avatars (Labubu, CalHacks Bear, Rubber Duck) with emoji/CSS faces as the mandatory fallback; the human said images may be searched online, so nextjs-developer downloads them into apps/web/public/avatars/ (idle image P0, other states P1).
- The AI is a local Ollama model on the same laptop; the backend must be started before the demo and warmed. F4 stays P1 with silent fallback to the bank.
- No event content rules; the two roast modes (profane default, clean) cover both audiences.
- Desktop Chrome, single user, camera permission granted on the demo laptop.
- Brief features 4 (ASCII art) and 1 are merged into F1 for the bank version because the demo's wow moment (step 3 of the brief) needs ASCII art; the AI-generated version of it is in F4. Brief's ranking is otherwise honored: 1 = F1, 2 = F2, 3 = F4, 4 = bank in F1 and AI in F4, 5 = F5. F3 (shell, seeded files, hotkeys) is added as P0 because the human's decisions require the VS Code look and the demo-safety controls.

## Open questions
- none
