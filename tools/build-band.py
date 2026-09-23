#!/usr/bin/env python3
"""The band, and the tiles it and the Open Mappr plate are cut from.

    python3 tools/build-band.py

Writes two things:

  assets/tiles.svg   one sprite of symbols, loaded once and shared by the band
                     on every page, by the plate, and by the drawn cards on the
                     house page (e-key, e-skirt, e-link). For each of the six motifs:
                       g-<name>  board 07's glaze, in the motif's owner's colour
                       o-<name>  the same motif as board 07 draws it below the
                                 glaze, in outline, in that colour
                       p-<name>  the glaze on an opaque ground square, for the
                                 plate, which has to cover what is under it

  the band markup    between <!--band:start--> and <!--band:end--> in
                     index.html (the house) and mappr/index.html (Mappr).

The band is one row of the field, fired (book board 14). Every motif wears its
owner's colour: Mappr the quarter disc in yellow, Flowr the pinwheel in blue,
Docr the half disc in green, and the other three keep board 07's orange, red and
violet. So the house band is the index laid out as tiles, and a tool's band is
that tool's one glaze and one motif.

  house   dealt from a shuffled deck of the six, so every motif turns up as often
          as the others and none sits beside itself; an open tile about one in
          four, never two side by side
  tool    solid and open alternate, so no two solids of the same colour touch;
          the motif turns a quarter every other tile

Forty tiles, centred and clipped, so the band bleeds off both edges at any width
up to 2720px. The fire-in delay counts from the tile that sits at the left edge
of a 1440 screen, so on most screens it visibly runs left to right from the
start.

The glazes in glaze-lib.json are board 07's own paths, lifted from the brand
book; motif-lib.json is the outline set build-hero.py already uses.
"""
import json, os, random, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))
from glaze import jitter, resample, path    # board 05's hand, the same one the hero uses
os.chdir('..')

GLAZE = json.load(open('tools/glaze-lib.json'))       # six lists of {d, attrs}, 120 box
MOT = json.load(open('tools/motif-lib.json'))         # name -> {paths, w, h}, 100 box
NAMES = ['quarter-disc', 'cut-diamond', 'pinwheel', 'square-in-square', 'half-disc', 'four-petals']
GIDX = {'quarter-disc': 0, 'cut-diamond': 1, 'pinwheel': 2, 'square-in-square': 3, 'half-disc': 4, 'four-petals': 5}
ACC = dict(red='#ff8787', orange='#ffa94d', yellow='#ffd43b', green='#69db7c', blue='#74c0fc', violet='#b197fc')
PAIR = {'quarter-disc': 'yellow', 'pinwheel': 'blue', 'half-disc': 'green',
        'cut-diamond': 'orange', 'square-in-square': 'red', 'four-petals': 'violet'}
GROUND = '#121212'
OWN = re.compile(r'#(?!121212)[0-9a-fA-F]{6}')
N, SEEN_FROM = 40, 9          # tiles in a band; the first tile a 1440 screen shows
SPRITE = '/assets/tiles.svg'


def glaze(name):
    col = ACC[PAIR[name]]
    return ''.join(f'<path d="{p["d"]}" {OWN.sub(col, p["attrs"])}/>' for p in GLAZE[GIDX[name]])


def outline(name):
    sc = .7
    off = (120 - 100 * sc) / 2
    ps = ''.join(f'<path d="{d}"/>' for d in MOT[name]['paths'])
    return (f'<g transform="translate({off:g},{off:g}) scale({sc})" fill="none" stroke="{ACC[PAIR[name]]}" '
            f'stroke-width="{5.2 / sc:.2f}" stroke-linecap="round" stroke-linejoin="round">{ps}</g>')


def edge(w, h, seed, inset=2.0, amp=1.2):
    """A closed drawn rectangle at close to its real size (board 05)."""
    rnd = random.Random(seed)
    box = [(inset, inset), (w - inset, inset), (w - inset, h - inset), (inset, h - inset), (inset, inset)]
    p = jitter(resample(box, rnd), rnd, amp)
    p[-1] = p[0]
    return path(p) + ' Z'


def frames(name, w, h, seed, fill, sw):
    """Three frames for a drawn control, each a pass plus the 62 percent pass at
    half opacity, cycled on hover. Shared here so every card is not carrying
    its own copy of the same six paths."""
    out = []
    for f in range(3):
        out.append(f'<symbol id="{name}-{f+1}" viewBox="0 0 {w} {h}" preserveAspectRatio="none">'
                   f'<path d="{edge(w, h, seed*10+f)}" fill="{fill}" stroke="currentColor" stroke-width="{sw}" stroke-linejoin="round"/>'
                   f'<path d="{edge(w, h, seed*10+f+5)}" fill="none" stroke="currentColor" stroke-width="{sw*.62:.2f}" stroke-linejoin="round" opacity=".5"/></symbol>')
    return out


def sprite():
    out = []
    # the tool cards are keys: a drawn face on a drawn skirt (board 15)
    out += frames('e-key', 360, 268, 101, '#1e1e1e', 2)
    out.append(f'<symbol id="e-skirt" viewBox="0 0 360 268" preserveAspectRatio="none">'
               f'<path d="{edge(360, 268, 990, 1.5, 1.0)}" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>')
    # the community link cards
    out += frames('e-link', 600, 76, 51, '#1e1e1e', 1.6)
    for n in NAMES:
        out.append(f'<symbol id="g-{n}" viewBox="0 0 120 120">{glaze(n)}</symbol>')
        out.append(f'<symbol id="o-{n}" viewBox="0 0 120 120">{outline(n)}</symbol>')
        out.append(f'<symbol id="p-{n}" viewBox="0 0 120 120"><rect x="-1" y="-1" width="122" height="122" fill="{GROUND}"/>{glaze(n)}</symbol>')
    return ('<svg xmlns="http://www.w3.org/2000/svg">\n'
            '<!-- Generated by tools/build-band.py. Do not hand-edit. -->\n' + '\n'.join(out) + '\n</svg>\n')


def house(seed=6061):
    rnd = random.Random(seed)
    seq, last, last_open, since, deck = [], None, True, 0, []
    for i in range(N):
        if not deck:
            deck = NAMES[:]
            rnd.shuffle(deck)
            if deck[0] == last:
                deck.append(deck.pop(0))
        m = deck.pop(0)
        since += 1
        kind = 'o' if (not last_open and since >= 3 and rnd.random() < .5) else 'g'
        if kind == 'o':
            since = 0
        seq.append((kind, m, rnd.choice([0, 90, 180, 270])))
        last, last_open = m, kind == 'o'
    return seq


def tool(motif):
    return [('o' if i % 2 else 'g', motif, ((i // 2) * 90) % 360) for i in range(N)]


def markup(seq, owner):
    tiles = ''.join(
        f'<span class="bt" style="--i:{max(0, i - SEEN_FROM)}"><svg viewBox="0 0 120 120">'
        f'<g transform="rotate({r} 60 60)"><use href="{SPRITE}#{k}-{m}"/></g></svg></span>'
        for i, (k, m, r) in enumerate(seq))
    return (f'<div class="tileband" data-owner="{owner}" aria-hidden="true"><div class="row">{tiles}</div></div>')


open('assets/tiles.svg', 'w').write(sprite())
for page, seq, owner in (('index.html', house(), 'house'), ('mappr/index.html', tool('quarter-disc'), 'mappr')):
    s = open(page).read()
    if '<!--band:start-->' not in s:
        s = s.replace('</header>', '</header>\n\n<!--band:start-->\n<!--band:end-->', 1)
    s = re.sub(r'(<!--band:start-->).*?(<!--band:end-->)',
               lambda mm: mm.group(1) + '\n' + markup(seq, owner) + '\n' + mm.group(2), s, flags=re.S)
    open(page, 'w').write(s)
    print(f'{page:18} {owner:6} band of {len(seq)}')
print(f'assets/tiles.svg   {os.path.getsize("assets/tiles.svg")} bytes')
