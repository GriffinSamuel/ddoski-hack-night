"""Async Ollama client for roast generation. Never logs or echoes the user's code or upstream bodies."""
import asyncio
import json
import logging
import re

import httpx

from app.config import get_settings
from app.prompts.roast import WARMUP_MESSAGES, build_messages
from app.schemas import RoastLine, RoastLinesResponse, RoastReplacementResponse

log = logging.getLogger("app.ollama")

CONNECT_TIMEOUT_S = 1.0
WARMUP_TIMEOUT_S = 120.0  # cold load is about 50 s
# num_ctx must be identical in warm-up and real calls, otherwise Ollama reloads the model.
BASE_OPTIONS = {"num_ctx": 4096}

CURSE_RE = re.compile(
    r"\b(fuck\w*|shit\w*|damn\w*|dumbass\w*|jackass\w*|asshole\w*|ass|bitch\w*|crap\w*|piss\w*|bastard\w*|hell|wtf)\b",
    re.IGNORECASE,
)
LEADING_HASH_RE = re.compile(r"^[#\s]+")


class AiUnavailableError(Exception):
    pass


class AiGenerationError(Exception):
    pass


class AiTimeoutError(Exception):
    pass


def _timeout(total: float) -> httpx.Timeout:
    return httpx.Timeout(total, connect=CONNECT_TIMEOUT_S)


async def is_available() -> bool:
    """Quick check (under ~1 s): Ollama reachable and the configured model pulled. Never raises."""
    s = get_settings()
    try:
        async with httpx.AsyncClient(base_url=s.ollama_base_url, timeout=_timeout(1.0)) as c:
            res = await c.get("/api/tags")
            res.raise_for_status()
            names = {m.get("name") for m in res.json().get("models", []) if isinstance(m, dict)}
    except Exception:
        return False
    wanted = s.ollama_model
    return wanted in names or (":" not in wanted and f"{wanted}:latest" in names)


async def warm_up() -> bool:
    """One tiny generation so the model stays resident (keep_alive -1). Never raises."""
    s = get_settings()
    if not await is_available():
        log.warning("AI warm-up skipped: Ollama unreachable or model %s not pulled", s.ollama_model)
        return False
    try:
        async with httpx.AsyncClient(base_url=s.ollama_base_url, timeout=_timeout(WARMUP_TIMEOUT_S)) as c:
            res = await c.post(
                "/api/chat",
                json={
                    "model": s.ollama_model,
                    "messages": WARMUP_MESSAGES,
                    "stream": False,
                    "format": "json",
                    "keep_alive": -1,
                    "options": {**BASE_OPTIONS, "num_predict": 8},
                },
            )
            res.raise_for_status()
        return True
    except Exception as e:
        log.warning("AI warm-up failed (%s)", type(e).__name__)
        return False


async def _chat(messages: list[dict]) -> str:
    s = get_settings()
    payload = {
        "model": s.ollama_model,
        "messages": messages,
        "stream": False,
        "format": "json",
        "keep_alive": -1,
        "options": {**BASE_OPTIONS, "temperature": 0.9, "num_predict": 160},
    }
    try:
        async with asyncio.timeout(s.ai_timeout_s):
            async with httpx.AsyncClient(base_url=s.ollama_base_url, timeout=_timeout(s.ai_timeout_s)) as c:
                res = await c.post("/api/chat", json=payload)
                res.raise_for_status()
                return res.json()["message"]["content"]
    except (TimeoutError, httpx.ReadTimeout, httpx.WriteTimeout, httpx.PoolTimeout):
        raise AiTimeoutError() from None
    except (httpx.ConnectError, httpx.ConnectTimeout):
        raise AiUnavailableError() from None
    except Exception as e:
        log.warning("AI call failed (%s)", type(e).__name__)
        raise AiGenerationError() from None


def _parse_json(raw: str) -> dict:
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```\w*\s*|\s*```$", "", text)
    try:
        data = json.loads(text)
    except ValueError:
        raise AiGenerationError() from None
    if not isinstance(data, dict):
        raise AiGenerationError()
    return data


def _clean_text(value: object, max_len: int) -> str | None:
    if not isinstance(value, str):
        return None
    text = LEADING_HASH_RE.sub("", " ".join(value.split()))
    text = text[:max_len].rstrip()
    return text or None


def _clean_art_line(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    text = value.replace("\r", "").replace("\n", " ").replace("\t", "    ")
    if text.startswith("# "):
        text = text[2:]
    elif text == "#":
        text = ""
    return text[:60].rstrip()


def _repair_lines(data: dict, code: str, emotion: str, avatar: str, mode: str) -> RoastLinesResponse:
    items = data.get("lines")
    if not isinstance(items, list):
        raise AiGenerationError()
    total_lines = len(code.splitlines())
    out: list[RoastLine] = []
    for item in items:
        raw_text, raw_line = (item.get("text"), item.get("line")) if isinstance(item, dict) else (item, None)
        text = _clean_text(raw_text, 200)
        if text is None or (mode == "clean" and CURSE_RE.search(text)):
            continue
        line = raw_line if isinstance(raw_line, int) and not isinstance(raw_line, bool) else None
        if line is not None and not 1 <= line <= total_lines:
            line = None
        out.append(RoastLine(text=text, line=line))
        if len(out) == 4:
            break
    if len(out) < 2:
        raise AiGenerationError()
    return RoastLinesResponse(kind="lines", emotion=emotion, avatar=avatar, mode=mode, lines=out)


def _repair_replacement(data: dict, avatar: str, mode: str) -> RoastReplacementResponse:
    mocks_raw, art_raw = data.get("mock_lines"), data.get("art_lines")
    if not isinstance(mocks_raw, list) or not isinstance(art_raw, list):
        raise AiGenerationError()
    mocks = []
    for m in mocks_raw:
        text = _clean_text(m, 120)
        if text is None or (mode == "clean" and CURSE_RE.search(text)):
            continue
        mocks.append(text)
        if len(mocks) == 3:
            break
    art = [a for a in (_clean_art_line(x) for x in art_raw) if a is not None and not CURSE_RE.search(a)]
    while art and not art[0].strip():
        art.pop(0)
    while art and not art[-1].strip():
        art.pop()
    art = art[:20]
    if len(mocks) < 2 or not art:
        raise AiGenerationError()
    return RoastReplacementResponse(
        kind="replacement", emotion="super-happy", avatar=avatar, mode=mode, mock_lines=mocks, art_lines=art
    )


async def generate_roast(
    code: str, file_name: str | None, emotion: str, avatar: str, mode: str
) -> RoastLinesResponse | RoastReplacementResponse:
    """Raises AiUnavailableError, AiTimeoutError or AiGenerationError."""
    messages = build_messages(code, file_name, emotion, avatar, mode)
    data = _parse_json(await _chat(messages))
    if emotion == "super-happy":
        return _repair_replacement(data, avatar, mode)
    return _repair_lines(data, code, emotion, avatar, mode)
