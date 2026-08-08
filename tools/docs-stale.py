#!/usr/bin/env python3
"""docs-stale.py — detect per-file docs whose source has changed underneath them.

Walks docs/_manifest.json, re-hashes every source file, and lists each entry whose
hash no longer matches what was recorded when the doc was written. Exit 1 if any
drifted, so it can gate a loop step.

WHY THIS EXISTS
    The project this repo was forked from documented ~130 files into a manifest
    that made staleness *detectable* -- and then nothing ever detected it. Some per-file
    docs silently described an older version of their file for months. The manifest
    without this script is a promise nobody keeps. It is the top item in that
    project's own list of what it should have built.

MANIFEST FORMAT
    {"files": [
      {"path": "src/js/audio.js",
       "doc":  "docs/src/js/audio.md",
       "hash": "<sha256 of path's bytes at the time doc was written>",
       "status": "documented",
       "updated": "2026-07-26"}
    ]}

    `hash` is sha256 of the SOURCE file's raw bytes. A missing hash means the entry
    was never baselined -- reported as UNBASELINED, which also fails the run, because
    an unbaselined entry can never be detected as stale.

USAGE
    python3 tools/docs-stale.py           # or: npm run docs:stale
    python3 tools/docs-stale.py --update  # re-baseline every hash to current bytes
                                          # (only after regenerating the docs)
"""
import hashlib
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "docs", "_manifest.json")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    update = "--update" in sys.argv

    try:
        with open(MANIFEST, encoding="utf-8") as fh:
            manifest = json.load(fh)
    except FileNotFoundError:
        print("docs-stale: %s not found" % os.path.relpath(MANIFEST, ROOT))
        return 1
    except json.JSONDecodeError as exc:
        print("docs-stale: manifest is not valid JSON: %s" % exc)
        return 1

    entries = manifest.get("files") or []
    if not entries:
        print("docs=0 drifted=0 missing=0 unbaselined=0")
        print("docs-stale: manifest is empty — the documentarian pass has not run yet.")
        return 0

    drifted, missing_src, missing_doc, unbaselined = [], [], [], []

    for entry in entries:
        rel = entry.get("path")
        if not rel:
            continue
        src = os.path.join(ROOT, rel)
        doc_rel = entry.get("doc")

        if not os.path.exists(src):
            missing_src.append(rel)
            continue
        if doc_rel and not os.path.exists(os.path.join(ROOT, doc_rel)):
            missing_doc.append((rel, doc_rel))

        current = sha256(src)
        recorded = entry.get("hash")

        if update:
            entry["hash"] = current
            continue
        if not recorded:
            unbaselined.append(rel)
        elif recorded != current:
            drifted.append((rel, doc_rel, recorded, current))

    if update:
        with open(MANIFEST, "w", encoding="utf-8") as fh:
            json.dump(manifest, fh, indent=2)
            fh.write("\n")
        print("docs-stale: re-baselined %d entries" % len(entries))
        return 0

    for rel, doc_rel, old, new in drifted:
        print("DRIFTED      %s  ->  %s" % (rel, doc_rel or "(no doc)"))
        print("             recorded %s… now %s…" % (old[:12], new[:12]))
    for rel in missing_src:
        print("MISSING-SRC  %s  (documented but the source is gone)" % rel)
    for rel, doc_rel in missing_doc:
        print("MISSING-DOC  %s  ->  %s  (doc listed but not on disk)" % (rel, doc_rel))
    for rel in unbaselined:
        print("UNBASELINED  %s  (no hash recorded — staleness cannot be detected)" % rel)

    print("docs=%d drifted=%d missing=%d unbaselined=%d"
          % (len(entries), len(drifted), len(missing_src) + len(missing_doc), len(unbaselined)))

    return 1 if (drifted or missing_src or missing_doc or unbaselined) else 0


if __name__ == "__main__":
    sys.exit(main())
