#!/usr/bin/env python3
"""Make drawn paths smaller without changing a pixel.

    python3 tools/compact.py FILE...

Every hand-drawn path on the site is a polyline: M, then a long run of L,
sometimes a Z. Written absolutely with a space and an L before every point it
is mostly repetition. This rewrites each such path as one M and one relative
l with implicit repeats, drops leading zeros and trailing .0, and leaves
anything that uses curves, arcs or other commands exactly as it was.

The coordinates are rounded to a tenth first and the steps are taken between
the rounded points, so rounding never accumulates along a path: every point
lands exactly where the original put it (to the tenth it was written at).

build-hero.py and build-band.py call it on what they write; it is also safe to
run by hand on any page.
"""
import re, sys

TOK = re.compile(r'[MLZmlz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?')
ONLY = re.compile(r'^[\sMLZ\d.,\-]+$')
D_ATTR = re.compile(r'(\sd=")([^"]*)(")')


def num(t):
    """t is tenths, an int."""
    s = f'{t / 10:.1f}'
    if s.endswith('.0'):
        s = s[:-2]
    if s.startswith('0.'):
        s = s[1:]
    elif s.startswith('-0.'):
        s = '-' + s[2:]
    return '0' if s in ('-0', '') else s


def join(nums):
    out = ''
    for n in nums:
        if not out or n.startswith('-'):
            out += n
        elif n.startswith('.') and '.' in out.split(' ')[-1].split('-')[-1]:
            out += n                      # ".5.5" reads as .5 then .5
        else:
            out += ' ' + n
    return out


def compact_d(d):
    if not ONLY.match(d):
        return d
    toks = TOK.findall(d)
    if not toks or toks[0] != 'M':
        return d
    parts, cmd, i, cur, run = [], None, 0, None, []

    def flush():
        if run:
            parts.append('l' + join(run))
            run.clear()

    while i < len(toks):
        t = toks[i]
        if t in 'MLZ':
            cmd = t
            i += 1
            if t == 'Z':
                flush()
                parts.append('z')
            continue
        if cmd not in ('M', 'L') or i + 1 >= len(toks):
            return d
        x, y = round(float(toks[i]) * 10), round(float(toks[i + 1]) * 10)
        i += 2
        if cmd == 'M':
            flush()
            parts.append('M' + join([num(x), num(y)]))
            cmd = 'L'                    # pairs after M are line-tos
        else:
            run.extend([num(x - cur[0]), num(y - cur[1])])
        cur = (x, y)
    flush()
    return ''.join(parts)


def compact_text(s):
    return D_ATTR.sub(lambda m: m.group(1) + compact_d(m.group(2)) + m.group(3), s)


if __name__ == '__main__':
    for f in sys.argv[1:]:
        a = open(f).read()
        b = compact_text(a)
        open(f, 'w').write(b)
        print(f'{f:28} {len(a):>7} -> {len(b):>7} bytes')
