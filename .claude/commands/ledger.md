---
description: Print current LEDGER.md state, deferred-check backlog, and provisional-uncited count
---

Report project state as a compact table. Do not edit anything.

1. LEDGER.md: total rows, and counts per STATUS (MISSING / PARTIAL / BUILT / APPROVED).
2. The 5 highest-value rows that are MISSING or PARTIAL, one line each.
3. VERIFY-LATER.md: pending count, superseded count. If pending > 25, say so explicitly
   and recommend a burn-down session.
4. Total `provisional-uncited` items across `docs/*-spec.md` — grep for the term and count.
   Name any ledger row that is BUILT while still carrying provisionals; those cannot go APPROVED.
5. Current baseline line from LEDGER.md, and whether the last recorded test counts still match
   a fresh run (do NOT run the suite; just say when it was last recorded).

Output only the report. No preamble.
