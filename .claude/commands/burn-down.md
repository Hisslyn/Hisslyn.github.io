---
description: Work the VERIFY-LATER.md deferred-check backlog with the build open
argument-hint: [how many entries to work, default 10]
---

Loop G — backlog burn-down. The user has the running build open. Work the VERIFY-LATER.md
pending queue top to bottom, up to $ARGUMENTS entries (default 10).

For each entry: restate the exact action and the expected result, then ASK the user what they
observed. Do not guess, and never mark an entry confirmed on your own authority.

- Passes  -> strike the line through, append `CONFIRMED <date>`.
- Fails   -> leave the entry, append `FAILED — see bug <N>`, and collect it into a numbered
             bug list formatted for /loop-d.
- Stale   -> mark `SUPERSEDED`, and write the replacement entry if the new behavior still
             needs checking.

Finish with a single commit: `verify-later: burn-down <date> — <N> confirmed, <N> failed,
<N> superseded`, then output the loop-D bug list for any failures.
