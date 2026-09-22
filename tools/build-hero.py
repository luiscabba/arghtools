#!/usr/bin/env python3
"""Regenerate the house page's quiet ceramic field, in place.

    python3 tools/build-hero.py

Writes between the <!--glaze:start--> / <!--glaze:end--> markers in index.html.
The rules it follows are board 07 (Ceramic) and board 05 (The hand):
keycaps drawn, 1.5 stroke at 7 percent; a motif inside at most a fifth of them,
1.6 stroke, group at 26 percent; module 68; no motif orthogonally adjacent to
another, and none inside a key that sits under the hero copy.
"""
import os, random, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from glaze import field

W, H, MODULE = 1560, 760, 68
TYPE_COLS, TYPE_ROWS = 12, 9     # the hero copy lives here; keep the field off it
NAMES = ['quarter-disc', 'cut-diamond', 'pinwheel', 'square-in-square',
         'half-disc', 'four-petals']
COLOURS = ['red', 'orange', 'yellow', 'green', 'blue', 'violet']

cols, rows = -(-W // MODULE), -(-H // MODULE)
rnd = random.Random(2292)
plan, used = [], {}
cands = [(c, r) for r in range(rows) for c in range(cols)
         if not (c < TYPE_COLS and r < TYPE_ROWS)]
rnd.shuffle(cands)
for c, r in cands:
    if len(plan) >= (cols * rows) // 14:
        break
    if any((c+dc, r+dr) in used for dc, dr in ((1,0), (-1,0), (0,1), (0,-1), (0,0))):
        continue
    n, col = rnd.choice(NAMES), rnd.choice(COLOURS)
    used[(c, r)] = (n, col)
    plan.append((c, r, n, col))

body, _, _ = field(W, H, module=MODULE, plan=plan)
svg = (f'<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" '
       f'xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n{body}\n</svg>')

p = os.path.join('..', 'index.html')
s = open(p).read()
s = re.sub(r'(<!--glaze:start-->).*?(<!--glaze:end-->)',
           lambda m: m.group(1) + '\n' + svg + '\n' + m.group(2), s, flags=re.S)
open(p, 'w').write(s)
print(f'{cols}x{rows} keys, {len(plan)} motifs ({len(plan)/(cols*rows):.0%}), {len(svg)} bytes')
