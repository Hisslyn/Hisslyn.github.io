#!/usr/bin/env python3
"""invariant-guard.py — make a project's hard invariants unbreakable by any agent.

Claude Code PostToolUse hook for Edit|Write|MultiEdit. When a file matching one of
the configured rules is edited, this re-reads it and BLOCKS the edit (exit 2) if it
introduces a forbidden pattern. The agent sees the stderr message in the same turn
and fixes it before moving on.

Generalized from autobattler's `sim-determinism-guard.py`, which enforced:

    packages/sim is pure: no Math.random, no Date, no floats.
    All randomness goes through the seeded mulberry32 PRNG in prng.ts.

WHY A HOOK AND NOT JUST A RULE IN CLAUDE.md
    Three layers of enforcement, cheapest first:
      1. hook  — blocks the edit, agent self-corrects immediately   <- this file
      2. test  — blocks the merge (a static text scan, as a unit test)
      3. doc   — informs the agent (CLAUDE.md Hard Invariants)
    Layer 3 alone does not hold: agents are agreeable and they forget. Layers 1 and 2
    cost about a day to build and hold permanently.

THE NON-OBVIOUS PART
    `strip_noise()` blanks comments and string literals BEFORE scanning, preserving
    line numbers and line length, so a comment like `// scale 1000 = 1.0` or a string
    like "v1.2.3" never false-positives a float check. This is the piece worth keeping.

CONFIGURE
    Edit invariant-guard.config.json next to this file. See that file for the schema.
    Scope every rule as NARROWLY as you can: a guard that fires on files it shouldn't
    gets bypassed, and a bypassed guard enforces nothing.

ESCAPE HATCHES (prefer fixing the code)
    - Append the allow-mark comment (default `guard-allow`) to a specific line.
    - Set the bypass env var (default ALLOW_GUARD_VIOLATION=1) to skip everything once.

TEST IT
    echo '{"tool_input":{"file_path":"src/core/engine.ts"}}' | python3 invariant-guard.py; echo "exit $?"
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.environ.get("INVARIANT_GUARD_CONFIG") or os.path.join(HERE, "invariant-guard.config.json")

DEFAULT_ALLOW_MARK = "guard-allow"
DEFAULT_BYPASS_ENV = "ALLOW_GUARD_VIOLATION"


def load_config():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except OSError:
        return None
    except json.JSONDecodeError as exc:
        # A broken config must be loud, not silently permissive.
        print("invariant-guard: config is not valid JSON (%s): %s" % (CONFIG_PATH, exc), file=sys.stderr)
        sys.exit(2)


def target_from_stdin():
    """Claude Code pipes the tool call as JSON; pull the edited file path."""
    try:
        data = json.load(sys.stdin)
    except Exception:
        return None
    ti = data.get("tool_input") or data.get("toolInput") or {}
    return ti.get("file_path") or ti.get("path") or data.get("file_path")


def rule_applies(rule, path):
    if rule.get("enabled") is False:
        return False
    p = path.replace("\\", "/")
    exts = rule.get("extensions") or []
    if exts and not any(p.endswith(e) for e in exts):
        return False
    for suffix in rule.get("exclude_suffixes") or []:
        if p.endswith(suffix):
            return False
    for frag in rule.get("exclude_paths") or []:
        if frag in p:
            return False
    includes = rule.get("include") or []
    if not includes:
        return True
    return any(frag in p for frag in includes)


def strip_noise(src, style="c"):
    """Return the source with comments and string/template literals replaced by blanks,
    preserving newlines and line length so reported line numbers and the allow-mark
    still line up. A char-by-char scanner rather than a regex, because nested quotes
    and escapes make regex unreliable.

    style: "c"    -> // line, /* block */, ' " ` strings   (JS/TS/Java/C/C#/Go/Rust/Swift)
           "hash" -> # line, ' " strings                   (Python/Ruby/shell/YAML/TOML)
           "none" -> scan raw text
    """
    if style == "none":
        return src
    out = []
    i, n = 0, len(src)
    state = "code"
    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ""
        if state == "code":
            if style == "c" and c == "/" and nxt == "/":
                state = "line_comment"; out.append("  "); i += 2; continue
            if style == "c" and c == "/" and nxt == "*":
                state = "block_comment"; out.append("  "); i += 2; continue
            if style == "hash" and c == "#":
                state = "line_comment"; out.append(" "); i += 1; continue
            if c == "'":
                state = "sq"; out.append(" "); i += 1; continue
            if c == '"':
                state = "dq"; out.append(" "); i += 1; continue
            if style == "c" and c == "`":
                state = "tq"; out.append(" "); i += 1; continue
            out.append(c); i += 1; continue
        if state == "line_comment":
            if c == "\n":
                state = "code"; out.append("\n")
            else:
                out.append(" ")
            i += 1; continue
        if state == "block_comment":
            if c == "*" and nxt == "/":
                state = "code"; out.append("  "); i += 2; continue
            out.append("\n" if c == "\n" else " "); i += 1; continue
        # inside a string literal: honor backslash escapes, keep newlines
        if c == "\\":
            out.append("  "); i += 2; continue
        if state == "sq" and c == "'":
            state = "code"; out.append(" "); i += 1; continue
        if state == "dq" and c == '"':
            state = "code"; out.append(" "); i += 1; continue
        if state == "tq" and c == "`":
            state = "code"; out.append(" "); i += 1; continue
        out.append("\n" if c == "\n" else " "); i += 1; continue
    return "".join(out)


def scan(path, rule, allow_mark):
    """Return [(lineno, reason, snippet)] for this rule, [] if clean."""
    try:
        with open(path, "r", encoding="utf-8") as fh:
            raw = fh.read()
    except OSError:
        return []  # can't read it (e.g. deleted) — nothing to guard
    raw_lines = raw.splitlines()
    code_lines = strip_noise(raw, rule.get("comment_style", "c")).splitlines()
    patterns = []
    for entry in rule.get("forbidden") or []:
        try:
            patterns.append((re.compile(entry["pattern"]), entry.get("reason", entry["pattern"])))
        except re.error as exc:
            print("invariant-guard: bad regex in rule %r: %s" % (rule.get("name"), exc), file=sys.stderr)
            sys.exit(2)
    found = []
    for idx, code in enumerate(code_lines):
        original = raw_lines[idx] if idx < len(raw_lines) else ""
        if allow_mark in original:
            continue  # explicit per-line opt-out
        for rx, reason in patterns:
            if rx.search(code):
                found.append((idx + 1, reason, original.strip()))
                break  # one reason per line is enough
    return found


def main():
    config = load_config()
    if not config:
        return 0  # no config = no guards; the hook is inert rather than noisy

    if os.environ.get(config.get("bypass_env", DEFAULT_BYPASS_ENV)) == "1":
        return 0

    target = sys.argv[1] if len(sys.argv) > 1 else target_from_stdin()
    if not target:
        return 0

    allow_mark = config.get("allow_mark", DEFAULT_ALLOW_MARK)
    blocked = False
    for rule in config.get("rules") or []:
        if not rule_applies(rule, target):
            continue
        violations = scan(target, rule, allow_mark)
        if not violations:
            continue
        blocked = True
        rel = target.replace("\\", "/")
        print("invariant-guard [%s]: blocked edit to %s" % (rule.get("name", "rule"), rel), file=sys.stderr)
        if rule.get("invariant"):
            print(rule["invariant"], file=sys.stderr)
        for lineno, reason, snippet in violations:
            print("  L%d: %s" % (lineno, reason), file=sys.stderr)
            if snippet:
                print("       %s" % snippet, file=sys.stderr)

    if blocked:
        print("Fix it, or add `%s` on the line if it is a true exception." % allow_mark, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
