# references/

Reference bibles. **The loop never builds a visual surface from an image — it builds from a `.md`
written from that image.**

Template: `/Users/azat/Desktop/claude-project-kit/templates/reference-bible.md.template`
Worked example: `/Users/azat/Desktop/claude-project-kit/exemplars/reference-bible.example.md`

## Protocol

1. The agent outputs `REFERENCES NEEDED: references/<name>.png — <what the capture must show>` and
   **STOPS**.
2. Azat drops the capture.
3. The agent writes `references/<name>.md` as a **named first step** — before any code: position
   expressed as **ratios relative to named landmarks** (never absolute pixels), structure, every
   state, how to read the capture, and a **DO-NOT-REPRODUCE list**.
4. Build from the bible, not the image.

Ratios rather than pixels is what buys resolution independence for free. "Gap ≈ 0.02 of panel height,
centered under the middle third" produces layout that survives every screen size; a pixel measurement
produces magic numbers. That matters doubly here, where the two stylesheets break at *different*
widths — always record which viewport width a capture was taken at.

Loop B additionally writes `references/<screen>-mine.md`, the same document for the *built* screen,
and diffs the two. Diffing two structured documents produces numbered, actionable, independently
checkable discrepancies; comparing two images produces vague impressions.

## Two rules specific to this project

**Commit the bibles.** They are specifications. Never gitignore `references/` — that is how the
source project ended up with its specifications outside version control (LESSONS.md §11). Gitignore
raw captures only if size ever demands it, and never the `.md`.

**Only text bibles and Azat's own captures live here — never a third-party screenshot.** Every file
in this repository is publicly served at `hisslyn.github.io`. Publishing someone else's design
capture to your own domain is a materially different posture from keeping one in a private repo. If a
reference can only be described rather than shown, describe it: a bible written from a screen you
looked at once is still a bible, and it is the artifact the loop actually consumes.

*No bibles yet.*
