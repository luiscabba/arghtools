#!/usr/bin/env python3
"""Stamp every stylesheet and script a page loads with a hash of its contents.

    python3 tools/stamp-assets.py

vercel.json lets a browser keep /assets/*.css and *.js for a day and serve
them stale for a week while it checks for a new copy. The pages are not
cached that way, so after a deploy a returning visitor can get the new page
with yesterday's stylesheet. On 25 Sept 2026 that turned the first seam,
unstyled, into a column 59,000px tall, and the page looked as if it ended at
the shelf until a refresh.

This writes ?v=<first 8 of the file's sha1> onto each /assets/....css and
/assets/....js href or src in the three pages, so a changed file is a new URL
and an unchanged one stays cached. Run it last, after any other build script
and after any edit to a stylesheet or script.
"""
import hashlib, os, re

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
PAGES = ['index.html', '404.html', 'mappr/index.html']
REF = re.compile(r'((?:href|src)=")(/assets/[\w./-]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')


def stamp(m):
    path = m.group(2)
    h = hashlib.sha1(open(path.lstrip('/'), 'rb').read()).hexdigest()[:8]
    return f'{m.group(1)}{path}?v={h}{m.group(3)}'


for p in PAGES:
    s = open(p, encoding='utf-8').read()
    t, n = REF.subn(stamp, s)
    open(p, 'w', encoding='utf-8').write(t)
    print(f'{p:18} {n} stamped')
