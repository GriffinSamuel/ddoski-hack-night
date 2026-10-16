---
description: Pipeline phase 4. Tests and review in parallel, then debugger on each failure.
---
Run phase 4 of the pipeline in CLAUDE.md.

1. In a single message, delegate in parallel to test-automator (demo-path tests, writes docs/TEST_REPORT.md) and surgeon-reviewer (writes docs/REVIEW.md).
2. Read both reports. For each failing test and each WILL BREAK finding, delegate to debugger one issue at a time, passing the exact failing test name or finding and the file it points to. Never batch several bugs into one debugger call.
3. Re-run test-automator after the fixes. Repeat step 2 at most twice; after that, list what is still failing and ask me whether to cut the feature or keep fixing.
4. Report the reviewer's verdict (SHIP, SHIP WITH FIXES, DO NOT SHIP), the final test result, and anything WILL COST or WILL ROT that is worth a few minutes. Commit with "Phase 4: verify" and tell me to run /ship when we hit feature freeze.
