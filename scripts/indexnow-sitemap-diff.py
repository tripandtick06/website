#!/usr/bin/env python3
"""Post-deploy IndexNow: submit only URLs that are new or whose <lastmod> changed.

Usage: indexnow-sitemap-diff.py <before.xml>
  before.xml = live sitemap saved BEFORE `wrangler pages deploy`.
Env: INDEXNOW_KEY, SITE_HOST. Never exits non-zero (IndexNow must not fail a deploy).

Why: the old postbuild hook skipped silently (no key in the build env) and the
manual workflow sent only the first 50 sitemap URLs, so content edits after the
GEO waves were never pinged to Bing (feeds ChatGPT search) / Yandex.
"""
import json
import os
import re
import sys
import time
import urllib.request

BLOCK = re.compile(r"<url>(.*?)</url>", re.S)
LOC = re.compile(r"<loc>([^<]+)</loc>")
LASTMOD = re.compile(r"<lastmod>([^<]+)</lastmod>")
ENGINES = ["https://www.bing.com/indexnow", "https://yandex.com/indexnow"]
WAIT_S, STEP_S = 300, 15


def parse(xml: str) -> dict:
    out = {}
    for block in BLOCK.findall(xml):
        loc, lm = LOC.search(block), LASTMOD.search(block)
        if loc:  # per-block: a missing <lastmod> never borrows the next entry's
            out[loc.group(1).strip()] = lm.group(1).strip() if lm else ""
    return out


def fetch(host: str) -> str:
    req = urllib.request.Request(f"https://{host}/sitemap.xml?cb={int(time.time())}",
                                 headers={"User-Agent": "tripandtick-deploy-indexnow"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def main() -> None:
    key, host = os.environ.get("INDEXNOW_KEY", ""), os.environ.get("SITE_HOST", "")
    if not key or not host:
        print("::warning::INDEXNOW_KEY/SITE_HOST missing — skipping IndexNow")
        return
    try:
        before_xml = open(sys.argv[1], encoding="utf-8").read()
    except (IndexError, OSError):
        before_xml = ""
    before = parse(before_xml)

    after, deadline = {}, time.time() + WAIT_S
    while time.time() < deadline:
        try:
            xml = fetch(host)
        except Exception as e:  # network blip: retry until deadline
            print(f"fetch failed: {e}")
            time.sleep(STEP_S)
            continue
        after = parse(xml)
        if xml != before_xml:
            break
        time.sleep(STEP_S)

    changed = [u for u, lm in after.items() if before.get(u) != lm]
    print(f"sitemap before={len(before)} after={len(after)} changed/new={len(changed)}")
    if not changed:
        print("No sitemap changes after deploy — nothing to submit.")
        return
    for u in changed[:20]:
        print(f"  {u} {before.get(u, '(new)')} -> {after[u]}")

    body = json.dumps({"host": host, "key": key, "keyLocation": f"https://{host}/{key}.txt",
                       "urlList": changed[:10000]}).encode("utf-8")
    for ep in ENGINES:
        try:
            req = urllib.request.Request(ep, data=body, method="POST",
                                         headers={"Content-Type": "application/json; charset=utf-8"})
            with urllib.request.urlopen(req, timeout=30) as r:
                print(f"{ep}: HTTP {r.status}")
        except urllib.error.HTTPError as e:
            print(f"::warning::{ep}: HTTP {e.code}")
        except Exception as e:
            print(f"::warning::{ep}: {e}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:  # never fail the deploy
        print(f"::warning::indexnow-sitemap-diff crashed: {e}")
