"""Build a quiet ceramic field the way the book draws one.

Keycaps: drawn outline, amplitude 1.2, sampled every 10-13px, round caps and
joins, one overshoot at the closing corner, stroke rgba(160,195,230,1) 1.5 at
7 percent. Motifs: the six from board 07, re-sampled and re-jittered at the
final size so the hand still reads, stroke 1.6, group at 26 percent.
Module 75 (the book's coarse option) so amplitude 1.2 reads on a screen.
"""
import json, math, random, re

MOT = json.load(open('motif-lib.json'))
AMP, STEP_LO, STEP_HI, OVER = 1.2, 10.0, 13.0, (4.0, 8.0)

def pts(d):
    out, cur = [], None
    for tok in re.findall(r'[ML]\s*(-?[\d.]+)\s+(-?[\d.]+)', d):
        out.append((float(tok[0]), float(tok[1])))
    return out

def seglen(a, b):
    return math.hypot(b[0]-a[0], b[1]-a[1])

def resample(poly, rnd):
    """Walk the polyline, dropping a point every 10-13px."""
    out, carry, target = [poly[0]], 0.0, rnd.uniform(STEP_LO, STEP_HI)
    for a, b in zip(poly, poly[1:]):
        L = seglen(a, b)
        t = 0.0
        while carry + (L - t) >= target:
            t += target - carry
            out.append((a[0] + (b[0]-a[0])*t/L, a[1] + (b[1]-a[1])*t/L))
            carry, target = 0.0, rnd.uniform(STEP_LO, STEP_HI)
        carry += L - t
    if seglen(out[-1], poly[-1]) > 1.0:
        out.append(poly[-1])
    return out

def jitter(poly, rnd, amp=AMP):
    return [(x + rnd.uniform(-amp, amp), y + rnd.uniform(-amp, amp)) for x, y in poly]

def overshoot(poly, rnd):
    """One overshoot per open outline, at the closing corner, 4 to 8px."""
    (x1, y1), (x2, y2) = poly[-2], poly[-1]
    L = math.hypot(x2-x1, y2-y1) or 1.0
    d = rnd.uniform(*OVER)
    return poly + [(x2 + (x2-x1)/L*d, y2 + (y2-y1)/L*d)]

def path(poly):
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in poly)

def keycap(ox, oy, size, rnd):
    """A keycap, drawn. Corners cut at 45 so it shares the motif geometry."""
    r = size * 0.16
    box = [(ox+r, oy), (ox+size-r, oy), (ox+size, oy+r), (ox+size, oy+size-r),
           (ox+size-r, oy+size), (ox+r, oy+size), (ox, oy+size-r), (ox, oy+r), (ox+r, oy)]
    return path(overshoot(jitter(resample(box, rnd), rnd), rnd))

def motif(name, ox, oy, size, rnd):
    """One of the six, as the book draws them inside a keycap (board 07's
    restraint panel; the pinwheel from its motif strip). Normalised to a
    100-unit box, so here we only place and scale: the hand is already in
    the coordinates, and re-drawing them at this size destroys the form."""
    m = MOT[name]
    k = size / 100.0
    w, h = m['w']*k, m['h']*k
    dx, dy = ox + (size-w)/2, oy + (size-h)/2
    return ['M' + ' L'.join(f'{x*k+dx:.1f} {y*k+dy:.1f}' for x, y in pts(d))
            for d in m['paths']]

ACCENT = dict(red='#ff8787', orange='#ffa94d', yellow='#ffd43b',
              green='#69db7c', blue='#74c0fc', violet='#b197fc')

def field(w, h, module=75, seed=22926, plan=None):
    rnd = random.Random(seed)
    cap = module * 0.80
    pad = (module - cap) / 2
    cols, rows = math.ceil(w/module), math.ceil(h/module)
    caps = [keycap(c*module+pad, r*module+pad, cap, rnd)
            for r in range(rows) for c in range(cols)]
    out = ['<g stroke="rgba(160,195,230,1)" stroke-width="1.5" stroke-linecap="round" '
           'stroke-linejoin="round" opacity=".07" fill="none">']
    out += [f'<path d="{d}"/>' for d in caps]
    out.append('</g>')
    out.append('<g opacity=".26" fill="none" stroke-linecap="round" stroke-linejoin="round">')
    for c, r, name, col in plan:
        for d in motif(name, c*module+pad+cap*0.225, r*module+pad+cap*0.225, cap*0.55, rnd):
            out.append(f'<path d="{d}" stroke="{ACCENT[col]}" stroke-width="1.6"/>')
    out.append('</g>')
    return '\n'.join(out), cols, rows
