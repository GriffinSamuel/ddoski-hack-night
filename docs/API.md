# API contract: Face-Roast Editor

Source of truth for `apps/api` and `apps/web`. Mirrored field for field in `apps/api/app/schemas.py` and `apps/web/lib/api-types.ts`. Only api-designer edits this file.

The AI provider is a local Ollama server (docs/DECISIONS.md, 2026-10-16). The request and response bodies are provider-agnostic and never mention it.

## Resources

| Resource | Table | Operations | Justified by |
|---|---|---|---|
| Health | none | `GET /api/v1/health` | Existing scaffold (`apps/api/app/routers/health.py`); frontend may read `ai_configured` for the status bar |
| Roast (action, not a stored resource) | none | `POST /api/v1/roast` | F4 (AI roasts, ASCII art), and the "Backend capabilities required" section of SPEC |

Two endpoints total. No database, no auth, no pagination, no realtime.

## Authentication

None. The product has no login (docs/DECISIONS.md). No endpoint takes a bearer token. CORS is already configured in `app/main.py` from `ALLOWED_ORIGINS`.

## Realtime

None. No Supabase tables exist (`supabase/migrations/0001_init.sql` is comment-only).

## Error envelope

Every non-2xx response has exactly the shape `app/main.py` produces via `error_body(code, message)`:

```json
{ "error": { "code": "ai_unavailable", "message": "AI provider unavailable" } }
```

How to emit it (fastapi-developer): `app/main.py`'s `HTTPException` handler passes `detail` through unchanged when it is a dict containing an `"error"` key, so the roast router must raise `HTTPException(status_code=503, detail=error_body("ai_unavailable", "..."))`. A bare `HTTPException(503, "text")` would be rewritten to `internal_error`. Do not edit `main.py`. `RequestValidationError` is already re-wrapped to `422 validation_error`.

### Error codes

| Code | HTTP | Meaning | Frontend behavior |
|---|---|---|---|
| `ai_unavailable` | 503 | The AI provider (local Ollama) is unavailable: Ollama is unreachable at `OLLAMA_BASE_URL` (default `http://localhost:11434`), or `OLLAMA_MODEL` (default `qwen2.5-coder:7b`) is not available. Message is exactly "AI provider unavailable". Returned fast (connection refused / model-missing check, target well under 1 s), before any generation. | Use the bank. Status bar: "AI offline - using roast bank". Stop calling the endpoint for the rest of the session (or until `GET /health` shows `ai_configured: true`). |
| `ai_error` | 502 | The AI call failed, or returned output that cannot be repaired into the response schema. | Use the bank. Status bar: "AI offline - using roast bank". Try the endpoint again on the next edit. |
| `ai_timeout` | 504 | The backend's own generation deadline (6 s) elapsed. | Same as `ai_error`. |
| `validation_error` | 422 | Request body failed validation (e.g. `code` over 20000 characters, bad enum value). | Use the bank. Treat as a client bug; do not retry the same payload. |
| `bad_request` | 400 | Reserved for business-rule failures. Not currently emitted by the roast endpoint. | Use the bank. |
| `not_found` | 404 | Unknown path. | Use the bank. |
| `internal_error` | 500 | Unexpected server error. | Use the bank. |

General client rule: the frontend never blocks on this API. It aborts the fetch at 7000 ms (`ROAST_TIMEOUT_MS`), and any of: network error, abort, non-2xx, or a body that fails to parse means "use the bank, show 'AI offline - using roast bank'". No error dialog, ever. On a 2xx the status bar shows "AI online".

## Endpoint: GET /api/v1/health

Already implemented; documented as-is plus one new field. No auth, no body.

Response 200:

```json
{ "status": "ok", "supabase_configured": false, "anthropic_configured": false, "ai_configured": true }
```

- `supabase_configured` is irrelevant to the product (no Supabase use).
- `anthropic_configured` is retained for compatibility with the existing scaffold and will always be `false` (the product uses Ollama, not the Anthropic API).
- `ai_configured` (new, optional in the schema, boolean): `true` when the Ollama warm-up succeeded (the backend can reach Ollama and the configured model is available), at startup or at the last check. fastapi-developer implements it in `health.py`; until it is implemented the field may be absent, so the frontend must treat a missing value as unknown, not as false. The frontend may call health once on load to pick the initial status text ("AI online" vs "AI offline - using roast bank"); a failed or slow health call must not block anything.

## Endpoint: POST /api/v1/roast

One endpoint for all three emotions, with a response discriminated by `kind`.

Content rule (server-side obligation; fastapi-developer and prompt-engineer both enforce it, and it applies to the Ollama prompt). There are two modes. `profane`: mild cursing is allowed ("dumbass", "damn", "shit code"), aimed only at the code and the user's coding skill. `clean`: no cursing at all; the same jokes reworded. In BOTH modes: no slurs; nothing about race, gender, sexuality, religion, disability, nationality, or any protected group; no threats; no self-harm references; no comments about the user's appearance. The system prompt must state this, and the service must treat model output as untrusted (see Backend duties).

Request body (`RoastRequest`):

| Field | Type | Notes |
|---|---|---|
| `code` | string, max 20000 chars | Current buffer of the active tab. Frontend truncates to 20000 before sending. |
| `file_name` | string or null, max 255, optional | e.g. `bad_code.py` |
| `emotion` | `sad` \| `happy` \| `super-happy` | `neutral` is never sent. |
| `avatar` | `labubu` \| `calhacks-bear` \| `rubber-duck` | Voice of the roast. |
| `mode` | `profane` \| `clean` | Current roast mode. |

Response 200, `emotion` is `sad` or `happy` (`kind: "lines"`):

```json
{
  "kind": "lines",
  "emotion": "sad",
  "avatar": "labubu",
  "mode": "profane",
  "lines": [
    { "text": "find_dupes is O(n^2) and you still got it wrong, dumbass", "line": 3 },
    { "text": "'tmp' is never used, much like your brain on this one", "line": 4 }
  ]
}
```

- 2 to 4 items. `text` is comment-ready: no leading `# `, no newline characters, max 200 chars. The frontend adds `# `.
- `line` is 1-based and refers to the submitted `code`; `null` means no specific line (frontend inserts at the cursor). The backend sets it to `null` if the model's number is outside `1..number of lines in code`. The frontend must also ignore an out-of-range value.
- The frontend inserts all lines as one block above the first non-null `line` (else at the cursor).
- `emotion`, `avatar`, `mode` are echoes of the request.

Response 200, `emotion` is `super-happy` (`kind: "replacement"`):

```json
{
  "kind": "replacement",
  "emotion": "super-happy",
  "avatar": "labubu",
  "mode": "profane",
  "mock_lines": [
    "Look at you, grinning like your code works.",
    "Spoiler: it never did. Goodbye, dumbass."
  ],
  "art_lines": [
    "   _____   ",
    "  /     \\  ",
    " | () () | ",
    "  \\  ^  /  ",
    "   |||||   "
  ]
}
```

- `mock_lines`: 2 to 3 lines, comment-ready, max 120 chars each, in the avatar's voice.
- `art_lines`: 1 to 20 lines, each at most 60 characters, comment-ready (no leading `# `), art contains no text profanity. Leading spaces are significant and must be preserved.
- The frontend builds the new buffer as `# ` + each of `mock_lines`, then `# ` + each of `art_lines`, replacing the whole active buffer. Nothing is sent back to a server.

Backend duties (fastapi-developer):
0. Warm-up at startup: when the app starts, send one tiny generation to Ollama with `keep_alive: -1` (or another long keep_alive) so the model stays resident before the demo; the first real request must never pay the ~50 s cold load. Record success for `ai_configured` on `GET /health`. A failed warm-up must not stop the app from starting.
1. If the AI provider (local Ollama) is unavailable (unreachable at `OLLAMA_BASE_URL`, or `OLLAMA_MODEL` not available), return `503 ai_unavailable` with message "AI provider unavailable" fast, before building a prompt or starting generation. A connection error counts as unavailable. Do not wait out a long connect timeout (use a connect timeout of about 1 s).
2. Call the model once (non-streaming, no multi-step) requesting JSON-format output and capping generation at about 160 tokens (`num_predict` around 160), with an overall deadline of 6 s (measured warm: about 3.9 s for about 90 tokens); on deadline return `504 ai_timeout`; on any other provider error or unparseable output return `502 ai_error`. Never return partial or fabricated lines.
3. Sanitize output: strip a leading `# ` and newlines from every string; truncate art lines to 60 chars and cap at 20 lines; set out-of-range `line` to `null`; if fewer than 2 roast lines or 2 mock lines survive, return `502 ai_error`.
4. Never log `code` or return it; never put provider error bodies in `message`.

Error responses: 422, 502, 503, 504, 500, all `ErrorEnvelope`.

## OpenAPI 3.1

```yaml
openapi: 3.1.0
info:
  title: Face-Roast Editor API
  version: 1.0.1
  description: REST contract for the hackathon MVP. Source of truth for apps/api and apps/web. No auth, no database.
servers:
  - url: http://localhost:8000
    description: Local development
security: []
tags:
  - name: Health
    description: Liveness and configuration check.
  - name: Roast
    description: AI-generated roast lines and super-happy replacement text. Optional at runtime; the frontend falls back to its bank.
paths:
  /api/v1/health:
    get:
      operationId: getHealth
      tags: [Health]
      description: |
        Liveness check. ai_configured is true when the backend can reach the AI provider and the configured model is
        present (startup or last check); it is optional and a missing value means unknown. anthropic_configured is
        retained for compatibility and is always false.
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema: { $ref: '#/components/schemas/HealthResponse' }
  /api/v1/roast:
    post:
      operationId: createRoast
      tags: [Roast]
      description: |
        Calls the AI provider once to generate roast content in the avatar's voice. For emotion sad or happy it returns
        kind "lines" (2 to 4 comment-ready lines with optional 1-based line numbers). For emotion super-happy it
        returns kind "replacement" (2 to 3 mocking lines plus ASCII art, at most 20 lines of at most 60 chars).
        All strings are comment-ready (no leading "# ").
        CONTENT RULE, enforced server-side in both modes: no slurs; nothing about race, gender, sexuality, religion,
        disability, nationality or any protected group; no threats; no self-harm references; no comments about the
        user's appearance. Mode "profane" allows mild cursing aimed only at the code and the user's coding skill.
        Mode "clean" allows no cursing at all (same jokes, reworded).
        Fails fast with 503 ai_unavailable ("AI provider unavailable") when the AI provider (local Ollama) is unavailable
        (unreachable at OLLAMA_BASE_URL, or OLLAMA_MODEL not available), before any generation. Overall generation
        deadline 6 s, then 504 ai_timeout. Other AI failures return 502 ai_error.
        The frontend aborts at 7 s and uses its bank on any error.
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/RoastRequest' }
      responses:
        '200':
          description: Roast content
          content:
            application/json:
              schema: { $ref: '#/components/schemas/RoastResponse' }
        '422': { $ref: '#/components/responses/ValidationError' }
        '500': { $ref: '#/components/responses/InternalError' }
        '502': { $ref: '#/components/responses/AiError' }
        '503': { $ref: '#/components/responses/AiUnavailable' }
        '504': { $ref: '#/components/responses/AiTimeout' }
components:
  schemas:
    ErrorDetail:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          description: Machine-readable, snake_case. One of ai_unavailable, ai_error, ai_timeout, validation_error, bad_request, not_found, internal_error.
          example: ai_unavailable
        message:
          type: string
          description: Human-readable, safe to show.
    ErrorEnvelope:
      type: object
      required: [error]
      properties:
        error: { $ref: '#/components/schemas/ErrorDetail' }
    RoastEmotion:
      type: string
      enum: [sad, happy, super-happy]
      description: neutral is never sent.
    LineEmotion:
      type: string
      enum: [sad, happy]
    AvatarId:
      type: string
      enum: [labubu, calhacks-bear, rubber-duck]
    RoastMode:
      type: string
      enum: [profane, clean]
    HealthResponse:
      type: object
      required: [status, supabase_configured, anthropic_configured]
      properties:
        status: { type: string, enum: [ok] }
        supabase_configured: { type: boolean }
        anthropic_configured: { type: boolean, description: Retained for compatibility; always false. }
        ai_configured:
          type: boolean
          description: True when the Ollama warm-up succeeded (the backend can reach the AI provider and the configured model is available; startup or last check). Optional; absent means unknown.
    RoastRequest:
      type: object
      required: [code, emotion, avatar, mode]
      properties:
        code: { type: string, maxLength: 20000, description: Current buffer of the active tab. }
        file_name: { type: [string, 'null'], maxLength: 255 }
        emotion: { $ref: '#/components/schemas/RoastEmotion' }
        avatar: { $ref: '#/components/schemas/AvatarId' }
        mode: { $ref: '#/components/schemas/RoastMode' }
    RoastLine:
      type: object
      required: [text, line]
      properties:
        text: { type: string, minLength: 1, maxLength: 200, description: 'Comment-ready, no leading "# ", no newlines.' }
        line:
          type: [integer, 'null']
          minimum: 1
          description: 1-based line number in the submitted code this line refers to; null when none.
    RoastLinesResponse:
      type: object
      required: [kind, emotion, avatar, mode, lines]
      properties:
        kind: { type: string, enum: [lines] }
        emotion: { $ref: '#/components/schemas/LineEmotion' }
        avatar: { $ref: '#/components/schemas/AvatarId' }
        mode: { $ref: '#/components/schemas/RoastMode' }
        lines:
          type: array
          minItems: 2
          maxItems: 4
          items: { $ref: '#/components/schemas/RoastLine' }
    RoastReplacementResponse:
      type: object
      required: [kind, emotion, avatar, mode, mock_lines, art_lines]
      properties:
        kind: { type: string, enum: [replacement] }
        emotion: { type: string, enum: [super-happy] }
        avatar: { $ref: '#/components/schemas/AvatarId' }
        mode: { $ref: '#/components/schemas/RoastMode' }
        mock_lines:
          type: array
          minItems: 2
          maxItems: 3
          items: { type: string, minLength: 1, maxLength: 120 }
        art_lines:
          type: array
          minItems: 1
          maxItems: 20
          items: { type: string, maxLength: 60 }
    RoastResponse:
      oneOf:
        - $ref: '#/components/schemas/RoastLinesResponse'
        - $ref: '#/components/schemas/RoastReplacementResponse'
      discriminator:
        propertyName: kind
        mapping:
          lines: '#/components/schemas/RoastLinesResponse'
          replacement: '#/components/schemas/RoastReplacementResponse'
  responses:
    ValidationError:
      description: Request body failed validation (code over 20000 chars, bad enum value).
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorEnvelope' }
          example: { error: { code: validation_error, message: 'body.emotion: Input should be sad, happy or super-happy' } }
    InternalError:
      description: Unexpected server error.
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorEnvelope' }
          example: { error: { code: internal_error, message: Internal error } }
    AiError:
      description: The AI call failed or its output could not be repaired into the response schema.
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorEnvelope' }
          example: { error: { code: ai_error, message: AI request failed } }
    AiUnavailable:
      description: The AI provider (local Ollama) is unavailable (unreachable at OLLAMA_BASE_URL, or OLLAMA_MODEL not available). Returned fast; the frontend uses its roast bank.
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorEnvelope' }
          example: { error: { code: ai_unavailable, message: AI provider unavailable } }
    AiTimeout:
      description: The backend's 6 s generation deadline elapsed.
      content:
        application/json:
          schema: { $ref: '#/components/schemas/ErrorEnvelope' }
          example: { error: { code: ai_timeout, message: AI request timed out } }
```

Note: the OpenAPI document declares no `securitySchemes` because there is no authentication.
