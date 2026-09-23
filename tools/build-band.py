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
                     index.html (the house) and mappr/index.html (Mappr). Since
                     board 19 the band is the page's bar too: the wordmark and
                     the links as keys sit in the row.

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
from compact import compact_text           # same pixels, fewer bytes
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
N = 30                        # tiles in a band row, more than the widest screen shows
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
    # the nav keys in the band (board 19): an outline in three frames, and the
    # glaze it fills with under the cursor
    out += frames('e-nav', 150, 56, 71, 'none', 2)
    out.append(f'<symbol id="e-navfill" viewBox="0 0 150 56" preserveAspectRatio="none">'
               f'<path d="{edge(150, 56, 779, 1.5, 1.0)}" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></symbol>')
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


def tile(k, m, r, i):
    return (f'<span class="bt" style="--i:{i}"><svg viewBox="0 0 120 120">'
            f'<g transform="rotate({r} 60 60)"><use href="{SPRITE}#{k}-{m}"/></g></svg></span>')


def navkey(label, href, acc, short=None, extra=''):
    """A link as a key in the band: drawn in its colour, glazed under the cursor."""
    lab = (f'<span class="t"><span class="long">{label}</span><span class="short">{short}</span></span>'
           if short else f'<span class="t">{label}</span>')
    frames_ = ''.join(f'<use class="f{i}" href="{SPRITE}#e-nav-{i}" width="10" height="10"/>' for i in (1, 2, 3))
    return (f'<a class="nkey" href="{href}" style="--acc:{acc}"{extra}>'
            f'<svg class="fl" viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true"><use href="{SPRITE}#e-navfill" width="10" height="10"/></svg>'
            f'<svg class="ed" viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true">{frames_}</svg>{lab}</a>')


BRACE = ('<svg class="brace" width="24" height="22" viewBox="0 0 124 112" fill="none" aria-hidden="true">'
         '<path d="M30 14 C21 14.6 15.5 18 15.2 26 C14.8 36 15.4 44 15 52 C14.7 56.5 12 58 8 58.4 C12 58.8 14.8 60.4 15.1 65 C15.5 73 14.9 81 15.3 91 C15.6 99 21 102.4 30 103" stroke="#e3e3e3" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
         '<path d="M44 27 C58 26.4 74 26.8 88 27.4" stroke="#ff8787" stroke-width="7" stroke-linecap="round"/>'
         '<path d="M44 58.5 C60 58 78 58.4 94 59" stroke="#ffd43b" stroke-width="7" stroke-linecap="round"/>'
         '<path d="M44 90 C56 89.4 70 89.8 82 90.4" stroke="#74c0fc" stroke-width="7" stroke-linecap="round"/></svg>')


def markup(seq, owner, version=None, base=''):
    """The bar in the band (board 19): one sticky row. A tile bleeding off the
    left, the wordmark on the ground, a run of tiles that fires in and runs the
    wave and is cut off by the keys, the links as keys, and a tile bleeding off
    the right. The band's own rules (fire, wave, hover) still apply to every
    tile, because they all sit in a .tileband."""
    seq = list(seq)
    if owner == 'house':
        # the tile beside the wordmark is always a solid glaze, so the band
        # reads as starting at the wordmark rather than leaving a hole (board 20)
        j = next(i for i in range(1, len(seq)) if seq[i][0] == 'g')
        seq.insert(1, seq.pop(j))
    else:
        # a tool band alternates, so start it one along: open at the bleed,
        # solid beside the wordmark
        seq = seq[1:] + seq[:1]
    lead = tile(*seq[0], 0)
    mid = ''.join(tile(k, m, r, i + 1) for i, (k, m, r) in enumerate(seq[1:N - 1]))
    tail = tile(*seq[N - 1], 12)
    if owner == 'house':
        word = '<a class="nb-word" href="/" aria-label="ARGH!, home">ARGH!</a>'
        keys = (navkey('The tools', base + '#index', 'var(--yellow)', 'Tools')
                + navkey('What this is', base + '#rules', 'var(--blue)', 'Rules')
                + navkey('Join', base + '#join', 'var(--green)'))
    else:
        word = '<a class="nb-word" href="/mappr/">Mappr</a>'
        keys = (navkey('How it works', '#how', 'var(--yellow)', extra=' data-wide')
                + navkey('Keys', '#keys', 'var(--yellow)', extra=' data-wide')
                + navkey('ARGH!', '/', 'var(--ink)')
                + navkey('Open Mappr', '/mappr/app', 'var(--yellow)', extra=' data-solid data-plate="quarter-disc"'))
    return (f'<header class="navband" data-owner="{owner}">'
            f'<div class="tileband nb-lead" aria-hidden="true"><div class="row">{lead}</div></div>'
            f'<div class="nb-brand">{word}</div>'
            f'<div class="tileband nb-mid" aria-hidden="true"><div class="row">{mid}</div></div>'
            f'<nav class="nb-keys" aria-label="Site">{keys}</nav>'
            f'<div class="tileband nb-tail" aria-hidden="true"><div class="row">{tail}</div></div>'
            f'</header>')


open('assets/tiles.svg', 'w').write(compact_text(sprite()))
VERSION = '1.11.0'    # Mappr's, shown in its wordmark
# the 404 is the house's too (board 31), so it wears the house band; its keys
# point back at the house page rather than at sections it does not have
for page, seq, owner, base in (('index.html', house(), 'house', ''),
                               ('404.html', house(), 'house', '/'),
                               ('mappr/index.html', tool('quarter-disc'), 'mappr', '')):
    s = open(page).read()
    if '<!--band:start-->' not in s:
        s = s.replace('</header>', '</header>\n\n<!--band:start-->\n<!--band:end-->', 1)
    # the old bar goes: the band carries the wordmark and the links now
    s = re.sub(r'<header class="topbar">.*?</header>\n*', '', s, flags=re.S)
    # no rainbow stripe on any page: the band carries the colour (board 20)
    if True:
        s = re.sub(r'<div class="spectrum" aria-hidden="true">.*?</div>\n*', '', s, flags=re.S)
    s = re.sub(r'(<!--band:start-->).*?(<!--band:end-->)',
               lambda mm: mm.group(1) + '\n' + markup(seq, owner, VERSION, base) + '\n' + mm.group(2), s, flags=re.S)
    open(page, 'w').write(compact_text(s))
    print(f'{page:18} {owner:6} band of {len(seq)}, bar folded in')
print(f'assets/tiles.svg   {os.path.getsize("assets/tiles.svg")} bytes')
