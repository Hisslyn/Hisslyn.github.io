#!/usr/bin/env python3
"""check-site.py — the project baseline.

This repo has no test suite, so "tests green" cannot be the baseline. This script is
the substitute: one command, one shot, an exact set of integers that can be diffed
session over session. Run it before and after every session; the numbers must move
only for reasons you can name.

WHAT IT CHECKS

  1. Link / asset existence. Every href= and src= in every .html that points at a
     local file must resolve to a file that exists. This is the failure mode that
     actually breaks a static site: a renamed or moved asset silently 404s on one
     page and nothing else notices. External schemes (http, //, mailto, tel, data,
     javascript) and pure fragments are skipped; query strings are stripped before
     resolving.

  2. CSP presence (hard invariant I4). Every page carries its own
     <meta http-equiv="Content-Security-Policy"> because there is no server here to
     set a header. The invariant guard cannot enforce this: it is a forbidden-pattern
     engine with no "required pattern" concept, so a positive assertion has to live
     in a script. See CLAUDE.md, Hard invariants.

  3. .nojekyll presence (hard invariant I5). Also unenforceable by hook: the guard
     fires on Edit/Write/MultiEdit and never sees an `rm`.

WHAT IT DELIBERATELY DOES NOT CHECK

  Build reproducibility (regenerating each .min.* and byte-comparing it against the
  committed twin) would enforce I1 by content rather than by hook. It is not here
  because four of its inputs are currently gitignored, so it cannot run from a fresh
  clone -- see the `reproducible-build` row in LEDGER.md. Add it once that is fixed.

USAGE
    python3 tools/check-site.py      # or: npm run check:site
    exit 0 = clean, exit 1 = something is broken
"""
import os
import re
import sys
import urllib.parse

SKIP_DIRS = {"node_modules", ".git"}
SKIP_SCHEMES = ("#", "http://", "https://", "//", "data:", "mailto:", "javascript:", "tel:")
ATTR = re.compile(r'(?:href|src)\s*=\s*"([^"]+)"')
CSP = 'http-equiv="Content-Security-Policy"'


def html_files(root):
    out = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for name in sorted(filenames):
            if name.endswith(".html"):
                out.append(os.path.join(dirpath, name))
    return sorted(out)


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pages = html_files(root)

    broken = []
    no_csp = []
    refs = 0

    for page in pages:
        with open(page, encoding="utf-8") as fh:
            src = fh.read()
        rel_page = os.path.relpath(page, root)
        base = os.path.dirname(page)

        if CSP not in src:
            no_csp.append(rel_page)

        for raw in ATTR.findall(src):
            url = raw.strip()
            if not url or url.startswith(SKIP_SCHEMES):
                continue
            path = urllib.parse.urlparse(url).path
            if not path:
                continue
            target = os.path.normpath(os.path.join(base, urllib.parse.unquote(path)))
            refs += 1
            if not os.path.exists(target):
                broken.append((rel_page, raw))

    nojekyll = os.path.exists(os.path.join(root, ".nojekyll"))

    for page, url in sorted(broken):
        print("BROKEN  %s -> %s" % (page, url))
    for page in sorted(no_csp):
        print("NO-CSP  %s" % page)
    if not nojekyll:
        print("MISSING .nojekyll")

    print("pages=%d refs=%d broken=%d" % (len(pages), refs, len(broken)))
    print("csp_missing=%d nojekyll=%s" % (len(no_csp), "present" if nojekyll else "ABSENT"))

    return 1 if (broken or not nojekyll) else 0


if __name__ == "__main__":
    sys.exit(main())
