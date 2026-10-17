# Face-Roast Editor pitch

## Transformation
A hackathon attendee arrives with code they know is wrong and leaves with a laugh, a roast, and a file that vanished, in under 90 seconds of demo.

## Headline
Your face decides what happens to your code.

## One-liner
A webcam reads your mood; a meme avatar punishes your code.

## 90-second spoken pitch
Timestamps are cue points. Stage directions are in parentheses.

```
[0:00] (Editor open. Do not touch it yet.)
Your code gets judged anyway. This one judges you back.

[0:07] (Point at the camera tile and the emotion meter.)
A webcam reads your mood; a meme avatar punishes your code.

[0:12] (Click CalHacks Bear, then Labubu. Click into the nested loop in bad_code.py.)
This is a VS Code-style editor. Pick your punisher: Labubu, the CalHacks Bear, or the Rubber Duck. This nested loop is wrong and slow, so let's see what it thinks.

[0:26] (Make a sad face and hold. The bar fills over 1.5 seconds. If it stalls past 5 seconds, press Alt+2.)
Sad gets roasted. Watch the bar fill. Profane mode is on, so expect the word dumbass. The insult lands above my cursor, and Labubu reads it back to me.

[0:36] (Click Undo roast. Click good_code.py.)
Undo puts the code back, and nothing touched my disk. Now, correct code.

[0:44] (Smile moderately. Condescending comments appear and Labubu looks smug. Alt+3 if the meter stalls.)
Smile, and the editor becomes a condescending code reviewer.

[0:50] (Grin wide and hold. The overlay plays for about 3 seconds and large Labubu dances. Alt+4 if the meter stalls.)
And if you're too happy about it, it gets deleted. The overlay cannot be skipped, and ASCII art replaces the file.

[1:00] (Hold on the result and read the mocking comment aloud. Click Undo roast.)
Read the mocking comment out loud. Then undo, and the original code comes back. Nothing is saved, so a reload resets everything.

[1:08] (Switch to CalHacks Bear. Press Alt+2 on bad_code.py. Press Alt+P, then Alt+2; the status bar reads Mode: clean.)
Same code, different voice. Press Alt+P for clean mode: same jokes, no cursing, works for the judges with kids.

[1:16] (Point at the status bar. If it reads AI online, say the first line. If it reads AI offline, say the second.)
AI online: The local AI wrote this roast, and it names a real variable from the file.
AI offline: Everything you just saw runs in the browser, even with the AI off.

[1:22] (Point at the camera tile.)
Under the hood: Next.js and Monaco, a face model that runs in the browser, FastAPI, and a local Ollama model for the roasts. Webcam frames never leave the browser.

[1:30] (Hold on the final screen.)
A webcam reads your mood; a meme avatar punishes your code. Thank you.
```

Word count: 221 (spoken lines only, stage directions excluded; the AI line counted as the online version)

## Devpost

### What it does
Face-Roast Editor is a single-page, VS Code-style editor built on Monaco. A webcam reads your expression in the browser. A sad face inserts insulting comments above your cursor. A condescending smile adds "could be better" comments to code that already works. A too-happy face deletes the file, leaves a mocking comment and ASCII art, and plays a three-second overlay you cannot skip. Pick Labubu, the CalHacks Bear, or the Rubber Duck and each one reacts in its own voice. Undo restores everything. Nothing is saved to disk, and a reload resets the editor. Alt+P switches between profane and clean roasts.

### How we built it
Next.js 15 renders the page, with Monaco as the editor and a dark theme styled to look like VS Code. The face model runs in the browser on the webcam feed, so frames never leave the browser. A FastAPI backend sends the current file to a local Ollama model, which writes roasts that name a real function or variable. The backend warms the model at startup so the first roast is not slow. Every edit is a Monaco edit operation, so Ctrl+Z works, and a one-level snapshot backs the Undo roast button. If the backend or Ollama is down, a roast bank in the frontend takes over with no error on stage.

### Challenges
Face detection in venue light is the main risk. A dim room or projector glare can misread a neutral face, so the meter shows the live reading and hidden hotkeys force each emotion. The local model has a cold load of about 50 seconds, so the backend warms it once at startup. Keeping roasts funny but inside the rules took care: no slurs, no protected groups, nothing about appearance, threats, or self-harm, applied to the roast bank and the AI prompt. The build had under an hour, so the VS Code part is a look-alike, not an extension.

### What's next
A real VS Code extension, deferred until after the event. Voice roasts with text-to-speech. Emotions beyond the four we tuned, such as angry and surprised. Languages beyond Python. Saving files and roast history, which are cut for now because nothing is persisted by design.

## Taglines
1. Frown at your loops. Grin, and they vanish.
2. Code review, except the reviewer has a webcam.
3. Your face is the linter.
4. Keep a straight face. Keep your code.
5. Undo is the only mercy.

## Applied to the landing page
Not applied: this run was limited to docs/PITCH.md. apps/web/app/page.tsx belongs to nextjs-developer and is mid-build, and the landing page is the app screen itself.
