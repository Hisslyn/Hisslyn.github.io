#!/usr/bin/env python3
"""session-start.py — inject live project state into every new session's context.

Claude Code SessionStart hook. Reads LEDGER.md and VERIFY-LATER.md and returns
their current state via `hookSpecificOutput.additionalContext`, which the harness
injects into the model's context before the first turn.

WHY THIS EXISTS
    The loop system's whole premise is that a context reset costs nothing because
    LEDGER.md + git log reconstruct state. That was true but MANUAL — every session
    began with the agent reading files to orient. This hook makes orientation
    automatic and free: the agent starts already knowing the row counts, the
    deferred-check backlog, and the last commit.

    It is the native replacement for a "where was I" step.

OUTPUT CONTRACT
    Prints one JSON object on stdout:
      {"hookSpecificOutput": {"hookEventName": "SessionStart",
                              "additionalContext": "<text injected into context>"}}
    Exit 0 always. A hook that fails must never block a session from starting.

TEST IT
    echo '{}' | python3 .claude/hooks/session-start.py | python3 -m json.tool
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()


def read(name):
    try:
        with open(os.path.join(ROOT, name), "r", encoding="utf-8") as fh:
            return fh.read()
    except OSError:
        return None


def sh(*args):
    try:
        out = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, timeout=5)
        return out.stdout.strip() if out.returncode == 0 else None
    except Exception:
        return None


def ledger_summary(text):
    """Count rows per STATUS in the markdown table."""
    counts = {"MISSING": 0, "PARTIAL": 0, "BUILT": 0, "APPROVED": 0}
    rows = 0
    for line in text.splitlines():
        if not line.startswith("|") or line.startswith("|--") or "STATUS" in line:
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 3:
            continue
        rows += 1
        status = cells[2].upper()
        for key in counts:
            if key in status:
                counts[key] += 1
                break
    return rows, counts


def verify_later_summary(text):
    """Count pending vs superseded/confirmed deferred checks."""
    pending = superseded = confirmed = 0
    for line in text.splitlines():
        s = line.strip()
        if not s.startswith("-"):
            continue
        if "SUPERSEDED" in s or s.startswith("- ~~"):
            superseded += 1
        elif "CONFIRMED" in s:
            confirmed += 1
        elif "—" in s or "--" in s:
            pending += 1
    return pending, superseded, confirmed


def main():
    parts = []

    ledger = read("LEDGER.md") or read("PARITY.md")
    if ledger:
        rows, c = ledger_summary(ledger)
        parts.append(
            "LEDGER: %d rows — %d APPROVED, %d BUILT, %d PARTIAL, %d MISSING. "
            "Agents may set BUILT at most; only the maintainer sets APPROVED."
            % (rows, c["APPROVED"], c["BUILT"], c["PARTIAL"], c["MISSING"])
        )
        m = re.search(r"^Baseline.*$", ledger, re.MULTILINE)
        if m:
            parts.append(m.group(0).strip())

    vl = read("VERIFY-LATER.md")
    if vl:
        p, s, cf = verify_later_summary(vl)
        line = "VERIFY-LATER: %d pending deferred checks (%d superseded, %d confirmed)." % (p, s, cf)
        if p >= 25:
            line += " BACKLOG IS LARGE — recommend a burn-down session before more visual work."
        parts.append(line)

    last = sh("git", "log", "--oneline", "-1")
    if last:
        parts.append("Last commit: %s" % last)
    branch = sh("git", "rev-parse", "--abbrev-ref", "HEAD")
    dirty = sh("git", "status", "--porcelain")
    if branch:
        parts.append("Branch: %s (%s)" % (branch, "dirty" if dirty else "clean"))

    if not parts:
        sys.exit(0)  # no project system here; stay silent

    ctx = "Project state at session start:\n" + "\n".join("- " + p for p in parts)
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": ctx,
        }
    }))
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)  # never block a session
