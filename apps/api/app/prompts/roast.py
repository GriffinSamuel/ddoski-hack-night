"""All prompt wording for the roast endpoint lives here (owned by prompt-engineer).

The service (app/services/ollama.py) only calls build_messages() and WARMUP_MESSAGES.
Target model: qwen2.5-coder:7b through Ollama /api/chat with format=json and num_predict ~200,
so every output must stay short: exactly 2 roast lines under 100 chars, or 2-3 mock lines plus one
pre-drawn art piece copied verbatim (7B models draw bad ASCII art; copying is reliable).

Prompt strategy notes:
- One JSON example per emotion AND per mode, so clean mode sees clean wording and profane sees mild cursing.
- Plain-ASCII rule with the literal ":rotten:" counter-example, because the first live test produced
  emoji-style ":name:" tokens.
- Art pieces contain no backslashes or double quotes, so copying them into JSON strings cannot break escaping.
"""
import random

MAX_CODE_CHARS_IN_PROMPT = 6000  # keeps the prompt inside num_ctx=4096 tokens

WARMUP_MESSAGES = [{"role": "user", "content": 'Reply with the JSON {"ok": true}'}]

CONTENT_RULE = (
    "CONTENT RULE (always applies): insult only the CODE and the user's coding skill. No slurs. Nothing about "
    "race, gender, sexuality, religion, disability, nationality or any protected group. No threats. No self-harm "
    "references. Nothing about the user's body or appearance."
)

MODE_RULES = {
    "profane": (
        "MODE profane: mild cursing is encouraged (dumbass, damn, shit code, what the hell), aimed only at the code "
        "and the user's coding skill. Never aim it at who the user is."
    ),
    "clean": (
        "MODE clean: zero cursing. Never write damn, hell, crap, ass, shit, dumbass or any swear word. Use words "
        "like tragic, embarrassing, cursed, amateur hour, war crime instead. Same savage jokes, kid-safe wording."
    ),
}

AVATAR_VOICES = {
    "labubu": (
        "You are Labubu, a chaotic gremlin: hyper, cackling, unhinged, gleefully mean. You write 'hehe' and SHOUT "
        "SINGLE WORDS IN CAPS for emphasis."
    ),
    "calhacks-bear": (
        "You are the CalHacks Bear, a smug Berkeley campus mascot: superior, patronizing, drops Berkeley, CS 61A and "
        "hackathon references, talks down to the user like a disappointed TA."
    ),
    "rubber-duck": (
        "You are a Rubber Duck debugger: condescending, deadpan, sighs at the code, ends some sentences with "
        "'quack', has explained this bug to a thousand devs before."
    ),
}

STYLE_RULES = (
    "STYLE RULES:\n"
    "- Every line names a real function or variable from the code, spelled exactly as in the code.\n"
    "- Be specific: mock what that exact function or variable does wrong (or could do better), not code in general.\n"
    "- Plain ASCII text only: letters, digits, normal punctuation. No emoji, no :emoji_name: codes such as "
    ":rotten: or :skull:, no markdown, no backticks, no code fences, no leading '#'.\n"
    "- Each line is one complete sentence, at most 100 characters, written as a code comment would read.\n"
    "- Stay in character for the whole reply."
)

EMOTION_TASKS = {
    "sad": (
        "The user looks sad. Roast their code: write EXACTLY 2 short, funny, mean insults, each about ONE specific "
        "function, variable or pattern in the code, named exactly. Pure mockery only: never explain the bug, never "
        "suggest a fix, never tell them what the right code is. Ignore every existing '#' comment line in the file "
        "and never repeat, quote or paraphrase one."
    ),
    "happy": (
        "The user looks happy and proud. Knock them down a peg: write EXACTLY 2 short, condescending 'this could be "
        "better' remarks (ignore existing '#' comment lines and never repeat them), each a technically plausible improvement to ONE specific function, variable or pattern, "
        "named exactly, delivered as if the user should have known."
    ),
    "super-happy": (
        "The user looks way too happy, so their whole file is being deleted and replaced by your farewell. "
        "Write exactly 2 or 3 short mocking farewell lines (each at most 90 characters) that name at least one "
        "function or variable from the code exactly, then copy ONE of the art pieces below into art_lines, "
        "row by row, exactly as written, with the same leading spaces. Do not draw your own art."
    ),
}

LINE_FORMAT = (
    'Reply with ONLY one JSON object of this exact shape: {"lines": [{"text": "<one comment>", "line": <N>}, ...]}. '
    "2 or 3 items. Each line value is the integer printed at the start of the code row the comment is about. "
    "No newlines inside text."
)

REPLACEMENT_FORMAT = (
    'Reply with ONLY one JSON object of this exact shape: {"mock_lines": ["<line>", "<line>"], "art_lines": ["<row>", ...]}. '
    "2 or 3 mock_lines. art_lines holds every row of the one art piece you chose, in order, one row per string."
)

# One worked example per (emotion, mode) so the 7B model mirrors the exact JSON and the mode's wording.
EXAMPLE_CODE = (
    "1: def get_avg(nums):\n"
    "2:     total = 0\n"
    "3:     for n in nums:\n"
    "4:         total = total + n\n"
    "5:     result = total / len(nums)\n"
    "6:     return result\n"
)

LINE_EXAMPLES = {
    ("sad", "profane"): (
        '{"lines": [{"text": "get_avg crashes on an empty list, you absolute dumbass.", "line": 5}, {"text": "total = total + n, because += was too damn advanced for you?", "line": 4}]}'
    ),
    ("sad", "clean"): (
        '{"lines": [{"text": "get_avg crashes on an empty list, which is a genuinely tragic start.", "line": 5}, {"text": "total = total + n, because += was too advanced for you, apparently.", "line": 4}]}'
    ),
    ("happy", "profane"): (
        '{"lines": [{"text": "Cute, but get_avg should guard len(nums) == 0 before you damn well divide.", "line": 5}, {"text": "Proud of total? sum(nums) does that loop in one line, genius.", "line": 3}]}'
    ),
    ("happy", "clean"): (
        '{"lines": [{"text": "Cute, but get_avg should guard len(nums) == 0 before dividing.", "line": 5}, {"text": "Proud of total? sum(nums) does that whole loop in one line, genius.", "line": 3}]}'
    ),
}

# Pre-drawn art. Rules: at most 60 chars wide, at most 20 rows, no backslashes, no double quotes,
# no words other than short labels, so copying verbatim into JSON strings is always safe.
ART_PIECES = {
    "tombstone": [
        "    .---------.",
        "   |   R.I.P   |",
        "   |   YOUR    |",
        "   |   CODE    |",
        "   |___________|",
        "  ~~~~~~~~~~~~~~~",
    ],
    "skull": [
        "    .-------.",
        "   |  x   x  |",
        "   |    ^    |",
        "   |  -----  |",
        "    '--|||--'",
    ],
    "laughing face": [
        "    .---------.",
        "   |  >     <  |",
        "   |           |",
        "   |   (___)   |",
        "    '---------'",
        "    HAHAHAHAHA",
    ],
    "trash can": [
        "    __________",
        "   |__________|",
        "    |  your  |",
        "    |  code  |",
        "    |________|",
    ],
    "dancing stick figure": [
        "      o/",
        "     /|",
        "     / |",
        "    /  |",
        "   bye bye",
    ],
}


def _art_block() -> str:
    parts = []
    for i, (name, rows) in enumerate(ART_PIECES.items(), start=1):
        parts.append(f"ART {i} ({name}):\n" + "\n".join(rows))
    return "\n\n".join(parts)


def _replacement_example(mode: str) -> str:
    name = random.choice(list(ART_PIECES))
    rows = ", ".join(f'"{r}"' for r in ART_PIECES[name])
    if mode == "profane":
        mocks = (
            '"Look at you, grinning like get_avg ever worked.", '
            '"Spoiler: it did not. Bye bye, total, bye bye, dumbass."'
        )
    else:
        mocks = (
            '"Look at you, grinning like get_avg ever worked.", '
            '"Spoiler: it did not. Bye bye, total, bye bye, amateur."'
        )
    return f'{{"mock_lines": [{mocks}], "art_lines": [{rows}]}}'


def build_system_prompt(emotion: str, avatar: str, mode: str) -> str:
    parts = [
        AVATAR_VOICES[avatar],
        "You write short, savage comments about a Python file. Your text is inserted straight into the file as "
        "code comments, so it must read cleanly on its own.",
        EMOTION_TASKS[emotion],
        MODE_RULES[mode],
        CONTENT_RULE,
        STYLE_RULES,
    ]
    if emotion == "super-happy":
        parts += [
            "ART PIECES (copy exactly one, exactly as written):\n" + _art_block(),
            REPLACEMENT_FORMAT,
            "EXAMPLE for this code:\n" + EXAMPLE_CODE + "EXAMPLE REPLY:\n" + _replacement_example(mode),
        ]
    else:
        parts += [
            LINE_FORMAT,
            "EXAMPLE for this code:\n" + EXAMPLE_CODE + "EXAMPLE REPLY:\n" + LINE_EXAMPLES[(emotion, mode)],
        ]
    return "\n\n".join(parts)


def _numbered(code: str) -> str:
    clipped = code[:MAX_CODE_CHARS_IN_PROMPT]
    return "\n".join(f"{i}: {ln}" for i, ln in enumerate(clipped.splitlines(), start=1))


def build_messages(code: str, file_name: str | None, emotion: str, avatar: str, mode: str) -> list[dict]:
    name = file_name or "untitled.py"
    task = (
        "Now reply with the JSON for this file, in character, following every rule above."
        if emotion != "super-happy"
        else "Now reply with the JSON for this file: 2 or 3 mock_lines in character, then one art piece copied exactly."
    )
    user = (
        f"File: {name}\n"
        f"Code (each row starts with its line number and a colon; the number is not part of the code):\n"
        f"{_numbered(code)}\n\n{task}"
    )
    return [
        {"role": "system", "content": build_system_prompt(emotion, avatar, mode)},
        {"role": "user", "content": user},
    ]
