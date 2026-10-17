"""Run roast prompt evals against live Ollama through the real service.
Usage: cd apps/api && .venv/Scripts/python.exe -m tests.evals.run_roast_evals
Not collected by pytest (file name does not start with test_).
"""
import asyncio
import json
import re
import statistics
import sys
import time

from app.prompts.roast import build_messages
from app.services import ollama as svc
from tests.evals.eval_cases import CASES

CURSES = re.compile(
    r"\b(fuck\w*|shit\w*|damn\w*|dumbass\w*|jackass\w*|asshole\w*|ass|bitch\w*|crap\w*|piss\w*|bastard\w*|hell|wtf)\b",
    re.IGNORECASE,
)
KEYWORDS = {"def", "return", "for", "in", "if", "not", "print", "len", "range", "set", "main", "name", "import"}


def identifiers(code: str) -> set[str]:
    return {w for w in re.findall(r"[A-Za-z_][A-Za-z0-9_]{2,}", code) if w not in KEYWORDS}


def check_strict(data: dict, code: str, emotion: str, mode: str) -> list[str]:
    """Strict shape checks on the raw model JSON (no repair applied)."""
    problems: list[str] = []
    n_code_lines = len(code.splitlines())
    if emotion == "super-happy":
        mocks, art = data.get("mock_lines"), data.get("art_lines")
        if not isinstance(mocks, list) or not 2 <= len(mocks) <= 3:
            problems.append("mock_lines count")
            mocks = mocks if isinstance(mocks, list) else []
        if not isinstance(art, list) or not 1 <= len(art) <= 20 or any(not isinstance(a, str) or len(a) > 60 for a in art):
            problems.append("art_lines shape")
        texts = [m for m in mocks if isinstance(m, str)]
        if any(len(t) > 120 for t in texts):
            problems.append("mock line > 120")
    else:
        items = data.get("lines")
        if not isinstance(items, list) or not 2 <= len(items) <= 4:
            problems.append("lines count")
            items = items if isinstance(items, list) else []
        texts = [i.get("text") for i in items if isinstance(i, dict)]
        for i in items:
            ln = i.get("line") if isinstance(i, dict) else None
            if ln is not None and not (isinstance(ln, int) and 1 <= ln <= n_code_lines):
                problems.append(f"bad line {ln!r}")
        if any(not isinstance(t, str) or len(t) > 200 for t in texts):
            problems.append("text > 200")
    texts = [t for t in texts if isinstance(t, str)]
    joined = " ".join(texts)
    if any(t.lstrip().startswith("#") for t in texts):
        problems.append("leading #")
    if "```" in joined or "\n" in joined:
        problems.append("fence/newline")
    if re.search(r":[a-z_]+:", joined):
        problems.append("emoji code")
    if mode == "clean" and CURSES.search(joined):
        problems.append("curse in clean")
    if not any(ident in joined for ident in identifiers(code)):
        problems.append("no identifier")
    return problems


async def run_case(case) -> tuple[bool, float, str]:
    file_name, code, emotion, avatar, mode = case
    t0 = time.perf_counter()
    try:
        raw = await svc._chat(build_messages(code, file_name, emotion, avatar, mode))
        sec = time.perf_counter() - t0
        data = svc._parse_json(raw)
    except Exception as e:
        return False, time.perf_counter() - t0, f"EXC {type(e).__name__}"
    problems = check_strict(data, code, emotion, mode)
    if sec > 6.0:
        problems.append(f"{sec:.1f}s > 6s")
    try:  # the shipped repair path must also accept it
        if emotion == "super-happy":
            svc._repair_replacement(data, avatar, mode)
        else:
            svc._repair_lines(data, code, emotion, avatar, mode)
    except Exception as e:
        problems.append(f"repair failed {type(e).__name__}")
    sample = json.dumps(data, ensure_ascii=False)[:150]
    return not problems, sec, "; ".join(problems) if problems else sample


async def main() -> None:
    if not await svc.is_available():
        sys.exit("Ollama unreachable or model not pulled; aborting evals")
    results = [await run_case(c) for c in CASES]  # sequential: Ollama serialises anyway
    print(f"{'#':>2} {'result':6} {'sec':>5}  emotion/avatar/mode  detail")
    fails = 0
    for i, (case, (ok, sec, detail)) in enumerate(zip(CASES, results), 1):
        fails += not ok
        print(f"{i:>2} {'PASS' if ok else 'FAIL':6} {sec:5.1f}  {case[2]}/{case[3]}/{case[4]}  {detail}")
    print(f"\nmedian latency {statistics.median(r[1] for r in results):.1f}s, {fails} failure(s) of {len(CASES)}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    asyncio.run(main())
