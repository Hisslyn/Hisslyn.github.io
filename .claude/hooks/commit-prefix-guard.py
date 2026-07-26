#!/usr/bin/env python3
"""commit-prefix-guard.py — hook-enforce the commit-prefix taxonomy from CLAUDE.md.

Claude Code PreToolUse hook for Bash. Reads the tool-call JSON on stdin, extracts
tool_input.command. If the command is not a `git commit` invocation, this is a no-op
(exit 0). Otherwise it extracts the commit message via -m/--message flags, takes the
first line of the first occurrence, and requires it to start with one of the seven
allowed prefixes (see CLAUDE.md's process-conventions "Commit prefixes" bullet — the
single source for the list; this file does not duplicate it beyond the constant below,
which exists to be checked against, not read as documentation) followed by a space.

WHY A HOOK AND NOT JUST A RULE IN CLAUDE.md
    CLAUDE.md documented the taxonomy but nothing enforced it (see commit 295ccda,
    "settings.json edit" — no prefix, in violation of the doc-only rule). A doc informs;
    a hook blocks.

`--amend` is handled exactly like a normal commit: if the amend command itself carries
an inspectable -m/--message flag, that message is checked. (An `--amend` with no -m
reuses the previous commit message via the editor and falls under the "no -m flag"
case below.)

LIMITATION — editor-driven commits
    If the commit command carries no -m/--message flag at all (e.g. plain `git commit`,
    which opens $EDITOR), this hook cannot see the message before it exists and cannot
    block it without executing the commit. In that case it ALLOWS the command (exit 0).
    This is a real gap, not an oversight: enforcing editor-driven commits would need a
    commit-msg git hook, not a PreToolUse tool hook.

ESCAPE HATCH (prefer fixing the message instead)
    Set ALLOW_COMMIT_PREFIX_VIOLATION=1 to skip the check once, mirroring
    invariant-guard.py's ALLOW_GUARD_VIOLATION bypass idiom.

TEST IT
    echo '{"tool_input":{"command":"git commit -m \"bad subject\""}}' \\
        | python3 commit-prefix-guard.py; echo "exit $?"
"""
import json
import shlex
import sys

BYPASS_ENV = "ALLOW_COMMIT_PREFIX_VIOLATION"

ALLOWED_PREFIXES = (
    "feat:",
    "fidelity:",
    "fix:",
    "feel:",
    "verify-later:",
    "docs:",
    "chore:",
)


def command_from_stdin():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return None
    ti = data.get("tool_input") or data.get("toolInput") or {}
    return ti.get("command")


def is_git_commit(tokens):
    """True if the parsed command tokens are a `git commit` invocation.
    Tolerates a leading env/path noise by just checking for the git..commit pair
    anywhere adjacent, since Claude Code Bash commands are single shell lines here."""
    for i in range(len(tokens) - 1):
        if tokens[i] == "git" and tokens[i + 1] == "commit":
            return True
    return False


def extract_first_message(tokens):
    """Return the first -m/--message value found, or None if there isn't one."""
    i = 0
    n = len(tokens)
    while i < n:
        tok = tokens[i]
        if tok == "-m" or tok == "--message":
            if i + 1 < n:
                return tokens[i + 1]
            return None
        if tok.startswith("--message="):
            return tok[len("--message="):]
        if tok.startswith("-m") and tok != "-m" and not tok.startswith("--"):
            # handles `-mSubject` (no space) form
            return tok[2:]
        i += 1
    return None


def main():
    import os

    command = None
    if len(sys.argv) > 1:
        command = sys.argv[1]
    else:
        command = command_from_stdin()

    if not command:
        return 0

    if os.environ.get(BYPASS_ENV) == "1":
        return 0

    try:
        tokens = shlex.split(command)
    except ValueError:
        # unbalanced quotes etc. — can't safely inspect; don't block on a parse failure
        return 0

    if not is_git_commit(tokens):
        return 0

    message = extract_first_message(tokens)
    if message is None:
        # editor-driven commit — see LIMITATION in the module docstring
        print(
            "commit-prefix-guard: no -m/--message flag found; cannot inspect an "
            "editor-driven commit message, allowing.",
            file=sys.stderr,
        )
        return 0

    first_line = message.splitlines()[0] if message else ""

    if any(first_line.startswith(prefix + " ") for prefix in ALLOWED_PREFIXES):
        return 0

    print(
        "commit-prefix-guard: blocked commit — subject line does not start with an "
        "allowed prefix.",
        file=sys.stderr,
    )
    print('  subject: "%s"' % first_line, file=sys.stderr)
    print(
        "  allowed prefixes: feat: fidelity: fix: feel: verify-later: docs: chore:",
        file=sys.stderr,
    )
    print(
        "Fix the message, or set %s=1 to bypass once." % BYPASS_ENV,
        file=sys.stderr,
    )
    return 2


if __name__ == "__main__":
    sys.exit(main())
