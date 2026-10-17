# Validation: Face-Roast Editor (webcam mood roasts and deletes your code)

## Verdict
GO, narrow to surface (b): a browser page that imitates VS Code (Monaco editor, webcam, avatar overlay, FastAPI plus Claude), not a real VS Code extension. Scored as a joke project per the brief (entertainment value stands in for "usefulness").

Why (b) over (a), all judgment unless cited:
- A real extension is outside the pipeline: the builder agents only know Next.js + FastAPI, and there is no scaffold, packaging, or test path for an extension in 1 hour.
- Webcam inside an extension needs a webview, where camera permission is a known trouble spot (my recollection, not verified in search). That can burn the whole hour.
- MediaPipe Face Landmarker runs in the browser and outputs blendshape scores ([Google docs](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js)); face-api.js is a ~310 KB in-browser expression model ([SitePoint](https://www.sitepoint.com/face-api-js-face-detection)).

Surviving BRIEF.md items: must-haves 1 and 2, nice-to-haves 3, 4, 5, and demo steps 1, 2, 3 all survive, edited in Monaco instead of VS Code. What is lost: the literal "VS Code extension" claim; say "VS Code-style editor" on stage.

## Pitch
A webcam reads your mood and a meme avatar punishes your code: sad gets roasted, too happy gets deleted.

## Competitors
| Name | URL | What it does | Gap we exploit |
| --- | --- | --- | --- |
| AssistRoast | https://github.com/YoussefReaper/AssistRoast | VS Code linter with 35 rules and gentle/annoying/savage modes | Rule-based; no webcam, no avatar, no deletion (page mentions no camera or AI) |
| RoastMyCode | https://github.com/Prkhar05/RoastMyCode | VS Code extension; local Ollama LLM plus Murf text-to-speech commentary | Reacts to code only, not to the person; no camera |
| DotSense | https://dev.to/freerave/i-built-an-ai-that-detects-your-mood-while-coding-locally-in-vs-code-1dn6 | VS Code extension inferring mood from typing rhythm | Mood from keystrokes, not face; suggests breaks rather than roasting |

Devpost-style search (2 queries) found no webcam-emotion code roaster. Absence is not proof; my search was shallow. Many generic roast tools exist (Product Hunt, DEV, GitHub), so the roast alone is not novel; the face-driven twist is.

## Demand
- Who: hackathon attendees and developers who share dev memes. Evidence is indirect: multiple roast-my-code tools exist on Product Hunt, DEV and GitHub.
- Today: they paste code into a roast tool or run a linter with attitude. No pain; this is entertainment.
- Switch: no utility reason. They would watch it for novelty, which is all a joke demo needs.

## Demo risk
Biggest: the emotion detector misfires live (dim room, projector glare, a neutral face read as happy), which deletes the code at the wrong moment or never triggers on stage. Face-API sources found give no lighting benchmark, so treat reliability as untested.
Mitigation (judgment): trigger on a sustained threshold (about 1 to 2 s) with a visible live emotion meter; add a hidden hotkey to force sad, happy, or super-happy on stage; do the deletion on an in-memory demo file, with undo available. Rehearse once in the venue light.

Secondary, handled not counted: Claude may soften heavy cursing and the key is unset. Ship a pre-written roast bank per avatar as fallback so the demo never depends on the API. Keep insults aimed at code and the user's skill, no slurs or protected groups.

Stack implications: Claude call goes through FastAPI (stateless, a few seconds, fine on Vercel Python function). Webcam frames stay in the browser; nothing uploaded. Supabase and auth are unused (no login), so the orchestrator should record that auth-integration-engineer is skipped.

## Judge criteria
| Criterion | Score (1-5) | Why |
| --- | --- | --- |
| Technical difficulty | 3 | Browser CV model driving editor state plus Claude code-specific roasts; not deep, but real |
| Originality | 4 | No face-driven roast found in 6 searches; roast tools themselves are common |
| Polish | 4 | One screen: editor, camera tile, avatar, deletion animation; easy to make striking |
| Usefulness (as entertainment) | 4 | Judgment: memorable and shareable; zero utility, which the brief accepts |

## Assumptions
- Usefulness is scored as entertainment value, per the brief.
- Single user, single laptop, webcam permission granted in the demo browser.
- Avatar images (Labubu, CalHacks bear) are sourced by the human; copyright is not assessed.
- Deferred: a real VS Code extension port, after the event.
