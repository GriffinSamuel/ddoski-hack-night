---
description: Start the hackathon. Runs pipeline phases 1 (scope) and 2 (contract) with human checkpoints, using a Figma design if one is given.
argument-hint: <idea> | Theme | Prize tracks | Team | Time limit | Figma: <link, optional>
---
We are starting a hackathon. Context from the human: $ARGUMENTS

You are the orchestrator described in CLAUDE.md. Do not write app code in this command.

1. Read CLAUDE.md and docs/DECISIONS.md. If docs/BRIEF.md exists, read it too: it is the human's full brief (ranked features, wow moment, constraints) and goes to every scope agent as an input file. Append dated rows to docs/DECISIONS.md for the time limit, the theme and prize tracks, and the team. If the time limit is missing, ask for it before anything else, because every agent scopes to it.

2. Delegate to project-idea-validator with the idea, theme, and time limit (plus docs/BRIEF.md if it exists). Show me its verdict in a few lines and STOP. The go/no-go is my call. If I pivot, run it again on the new idea.

3. After I say go, delegate to product-manager. Tell it the real time limit, which may be shorter than 24 hours.

4. Design. Check whether I gave a Figma link, in the arguments or in docs/BRIEF.md.
   a. If there is a Figma link: use the Figma tools available in this session to read it. Get a screenshot and the design context of each top-level frame, and the file's variables or styles (colors, type, spacing). If no Figma tools are available or the link cannot be read, tell me in one line and continue with step 4c as if there were no link.
   b. Write docs/FIGMA_NOTES.md with only what you read from the file: the link; each frame's name and what it shows; exact color values; font families, sizes and weights; spacing and corner radius; and the component list with how each component looks and which frames use it. Mark anything you could not read as unknown; do not guess. Append a dated row to docs/DECISIONS.md: "Visual design comes from Figma (docs/FIGMA_NOTES.md); Figma wins on any visual conflict."
   c. Delegate to ui-designer. If docs/FIGMA_NOTES.md exists, list it as an input and tell ui-designer to match it exactly in docs/DESIGN.md (tokens, components, layouts) and to design only what Figma does not cover, such as a screen in docs/SPEC.md with no matching frame, in the same visual style. Without Figma, delegate as normal.

5. Then delegate to api-designer.

6. Every delegation message names the input files, the output files expected, and ends with: reply in the STATUS/WROTE/VERIFIED/ASSUMPTIONS/OPEN QUESTIONS/NEXT format.

7. Show me a short summary: the P0 features, the demo script, the screens (and whether each came from Figma), and the endpoints. List every OPEN QUESTION the agents raised. Wait for my approval, then commit with the message "Phase 1-2: spec, design, contract" and tell me to run /build.
