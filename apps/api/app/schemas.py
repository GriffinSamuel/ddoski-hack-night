"""Data contract for the Face-Roast Editor API. Mirrors docs/API.md field for field.

No database, no auth: there are no Create/Update/Read resource models, only request/response bodies.
"""
from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field


# ---- Error envelope (identical to app.main.error_body) ----

class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorEnvelope(BaseModel):
    error: ErrorDetail


# ---- Shared enums (string-literal unions; TypeScript mirrors these) ----

# The emotion the editor is reacting to. "neutral" is never sent.
RoastEmotion = Literal["sad", "happy", "super-happy"]
# Emotions that produce a list of inserted comment lines.
LineEmotion = Literal["sad", "happy"]
AvatarId = Literal["labubu", "calhacks-bear", "rubber-duck"]
RoastMode = Literal["profane", "clean"]

# ---- Health ----

class HealthResponse(BaseModel):
    status: Literal["ok"]
    supabase_configured: bool
    # Retained for compatibility with the scaffold; always false (the product uses a local AI provider).
    anthropic_configured: bool
    # True when the Ollama warm-up succeeded. Optional: absent means unknown.
    ai_configured: bool | None = None


# ---- Roast ----

class RoastRequest(BaseModel):
    # 20 KB cap, counted in characters. The frontend truncates before sending.
    code: str = Field(max_length=20000)
    file_name: str | None = Field(default=None, max_length=255)
    emotion: RoastEmotion
    avatar: AvatarId
    mode: RoastMode


class RoastLine(BaseModel):
    # Comment-ready: no leading "# ", no newline characters.
    text: str = Field(min_length=1, max_length=200)
    # 1-based line number in the submitted `code` this line refers to; null = no specific line.
    line: int | None = Field(default=None, ge=1)


class RoastLinesResponse(BaseModel):
    kind: Literal["lines"]
    emotion: LineEmotion
    avatar: AvatarId
    mode: RoastMode
    lines: list[RoastLine] = Field(min_length=2, max_length=4)


class RoastReplacementResponse(BaseModel):
    kind: Literal["replacement"]
    emotion: Literal["super-happy"]
    avatar: AvatarId
    mode: RoastMode
    # Mocking comment block, comment-ready (no leading "# ").
    mock_lines: list[Annotated[str, Field(min_length=1, max_length=120)]] = Field(min_length=2, max_length=3)
    # ASCII art, comment-ready (no leading "# "), at most 20 lines, each at most 60 characters.
    art_lines: list[Annotated[str, Field(max_length=60)]] = Field(min_length=1, max_length=20)


RoastResponse = Annotated[
    Union[RoastLinesResponse, RoastReplacementResponse],
    Field(discriminator="kind"),
]
