#!/usr/bin/env python3
"""Write the seams into the house page (settled 24 September 2026).

    python3 tools/build-seams.py

A seam is one row of tiles between two sections of the house page, the band
repeated down the page. There is none under the hero, because the band is
already right above it. Each seam is written between a pair of
<!--seam:start--> / <!--seam:end--> markers in index.html, in page order; the
first run puts the markers in front of #rules, #join and the footer.

Tiles are dealt with a fixed seed per seam, so the page never changes unless
this script does. Most tiles are the open glaze at low opacity, about one in
eight is solid, and one in ten is left empty; about a quarter of the open ones
spin as you scroll, each at its own speed and in its own direction. The tiles sit in the
markup, so the seams are there without the script; assets/seams.js only moves
them.
"""
import os, random, re

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

NAMES = ['quarter-disc', 'cut-diamond', 'pinwheel', 'square-in-square', 'half-disc', 'four-petals']
SPRITE = '/assets/tiles.svg'
N = 44          # wider than any screen, so a seam can slide without showing its ends
BEFORE = ['<section class="section band" id="rules">', '<section class="section" id="join">', '<footer>']


def seam(k):
    rnd = random.Random(40 + k)
    out = []
    for i in range(N):
        name = NAMES[rnd.randrange(6)]
        rot = rnd.choice([0, 90, 180, 270])
        x = rnd.random()
        spin = rnd.random() < .28
        sp = (-1 if rnd.random() < .5 else 1) * (0.35 + rnd.random() * 0.5)
        if .12 <= x < .22:
            out.append(f'<span class="st e" style="--i:{i}"></span>')
            continue
        kind = 'g' if x < .12 else 'o'
        spin = spin and kind == 'o'   # a solid square turned off the grid looks broken
        cls = f'st {kind}' + (' spin' if spin else '')
        data = f' data-sp="{sp:.2f}"' if spin else ''
        out.append(f'<span class="{cls}" style="--i:{i}"{data}><svg viewBox="0 0 120 120" width="68" height="68">'
                   f'<g transform="rotate({rot} 60 60)"><use href="{SPRITE}#{kind}-{name}"/></g></svg></span>')
    return '<div class="seam" aria-hidden="true"><div class="row">' + ''.join(out) + '</div></div>'


def main():
    html = open('index.html', encoding='utf-8').read()
    if '<!--seam:start-->' not in html:
        for b in BEFORE:
            assert html.count(b) == 1, b
            html = html.replace(b, '<!--seam:start--><!--seam:end-->\n\n' + b)
    k = [0]

    def rep(m):
        s = '<!--seam:start-->' + seam(k[0]) + '<!--seam:end-->'
        k[0] += 1
        return s
    html = re.sub(r'<!--seam:start-->.*?<!--seam:end-->', rep, html, flags=re.S)
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'wrote {k[0]} seams')


if __name__ == '__main__':
    main()
