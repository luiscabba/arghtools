# arghtools

The site for **Mappr by ARGH!**, at arghtools.com.

Plain HTML and CSS. No framework, no build step, no dependencies. Vercel serves
the folder as it is, which is the same idea the app itself is built on: one file
that opens and works.

```
index.html                       the house page, ARGH! at the root
mappr/index.html                 the Mappr page
assets/site.css                  tokens, layout, the whole system
assets/tiles.svg                 the band, plate and drawn-card sprite (tools/build-band.py)
assets/mappr-demo.js             the looping map panel in the Mappr hero
assets/mappr-open.js             the Open Mappr plate
assets/keys.js                   lets a phone show why an unbuilt tool will not open
assets/hero-field.svg            the house hero's keycap field (tools/build-hero.py)
assets/fonts/                    Bricolage Grotesque 800, IBM Plex Sans and Mono
assets/Excalifont-Regular.woff2  the map's hand-drawn face (SIL OFL 1.1)
assets/icon.svg                  the brace mark, favicon
FONT-LICENSE.md                  travels with the font
```

To work on it, open `index.html` in a browser. There is nothing to install and
nothing to run.

## The design system

Settled on the ARGH! Identity Canvas, 22 September 2026. The site is a tool
page, so the rule that governs it is: **the tool owns the page, the parent
signs it.** The test is removal. Take away the index band and the footer block
and this should still be unmistakably Mappr.

- The parent appears twice. The `ARGH!` link in the bar and the footer
  endorsement block. Nothing between them belongs to the parent.
- `Less dragging.` is Mappr's line and it replaces `Less argh.` everywhere on
  this page. The house line appears once, in the footer, where the parent is
  speaking as itself.
- Yellow is Mappr's. The other five accents only appear in the index.
- Each tool owns one ceramic motif as well as one accent: Mappr the quarter
  arc, Flowr the pinwheel, Docr the half disc. Type no longer tells them apart,
  so the motif and the accent have to.

Type: **one display face across ARGH! and every tool.** Bricolage Grotesque 800
for display, IBM Plex Sans for reading, IBM Plex Mono for keys, labels, counts
and versions. Chakra Petch left the system on 22 Sept; the brace mark stays,
because the mark is where Mappr keeps its own identity now.

Colour is unchanged and still the important rule. Field, panel, line, ink,
muted and all six branch accents are read out of the app's `src/app.html` at
1.10.1, so the site and the app cannot drift apart. Ash `#b9bcc0` is the one
value added here.

- Text on any accent is Field `#121212`, never Ink.
- An accent as text sits only on Field or Panel, where all six clear 7.7 to 1.
- Yellow is the single call to action colour.
- Line `#343434` is for borders only. Never text, never an icon.
- If the app's dark palette changes, these change with it. The app is the source.

## The hand

Anything a person touches is drawn rather than ruled: buttons, the newsletter
field, and anything interactive added later. Structure stays straight: section
rules, dividers, the index band, the map grid, anything wider than about 480px
and anything under 20px.

The test for anything new is whether a person puts their cursor on it. If yes
it is drawn, if no it is straight.

- One amplitude everywhere, 1.2, sampled every 10 to 13px.
- A second pass at 62 percent of the main stroke and half opacity. This is not
  invented for the site: every node on the Mappr map is already drawn twice,
  which is what gives the app its hand.
- Three frames, cycled on hover with `steps`, 360ms. Never eased, because
  sliding between drawings is what makes a wobble look like a bug.
- Nothing moves at rest. Press drops a control 2px, the way a key does.
- `prefers-reduced-motion: reduce` gets frame one and no timer.

The edges are inline SVG with `preserveAspectRatio="none"`, drawn at close to
the real control size so the stretch stays invisible. A control that ends up
far from its drawn size needs its own frame rather than a harder stretch.

Grain is an SVG `feTurbulence` filter over the page at 5 percent. There is no
image file anywhere in it, so there is nothing to download or version.

## The map panel in the hero

`assets/mappr-demo.js` draws a map being built, about twelve seconds, looping,
no pause on hover. The keys it shows are the app's real ones, taken from the
help table in `src/app.html`:

| key | what it does |
|-----|--------------|
| `Cmd` + arrow | fork a branch that way; the same direction again goes deeper |
| `Enter` | another node beside this one, same level, same branch |
| `Shift` `Enter` | same level, in the next branch along |

The chips in the panel bar light in step with the action, and the node count in
the bar follows along, so the claim and the picture are the same thing.

Section 02 carries the outline exchange instead: the same content as markdown on
one side and as a map on the other. Its map is a still generated by this same
renderer, so the two panels are drawn by the same hand.

The layout is computed rather than hand-placed, so editing `SCRIPT` at the top
of the file changes the words, keys or timing and the map re-tidies itself
around whatever you put in.

`prefers-reduced-motion: reduce` gets the finished map as a still, with no timer
running.

## Still to do

- `/mappr` is not served yet. The app lives in its own repo, `luiscabba/mappr`,
  and every link here that points at `/mappr/` waits on it.
- Discord and Buy me a coffee are `#` placeholders until those exist.
- The newsletter form posts nowhere yet.

## Routes

Settled 22 September 2026, on board 12 of the brand book.

| Route | Owner | What sits there |
|---|---|---|
| `/` | ARGH! | The house page: the line, the shelf, the three rules, the community |
| `/mappr/` | Mappr | The tool page |
| `/mappr/app` | Mappr | The app, rewritten in from its own deployment |

The root is the house and never a tool. A tool owns everything under its own
folder, and the parent appears there exactly twice: the bar and the footer
endorsement block. Community lives at the root only, which is why the
`Join ARGH!` section left the Mappr page. A tool that is not built has no
route, so Flowr and Docr are names in the index, not links.

`/mappr/app` rewrites to `mappr-9v19.vercel.app`, the Mappr project's own
deployment. The rewrite means the app is served from arghtools.com rather than
redirected to, so the tool page and the app share one origin.

**Browser storage is per origin.** Maps made on the app's current address do
not follow it to `/mappr/app`. That migration is unsolved and it decides
whether this move can be made quietly.

## The ceramic field

The house page hero wears a quiet ceramic field: keycaps drawn at 7 percent,
a motif inside at most a fifth of them at 26, module 68. It is generated, not
hand-written. To change it:

    python3 tools/build-hero.py

That rewrites the block between `<!--glaze:start-->` and `<!--glaze:end-->` in
`index.html`. Do not hand-edit those paths. `tools/glaze.py` holds the hand's
settings from board 05 (amplitude 1.2, sampled every 10 to 13px, round caps and
joins, one overshoot at the closing corner) and `tools/motif-lib.json` holds
the six motifs lifted from board 07. The motifs are placed and scaled only,
never redrawn: re-sampling them at keycap size destroys the form.

## Critical CSS

Both pages carry an inlined block of critical CSS so a late stylesheet costs
polish rather than the whole design. It is generated, not hand-written:

    python3 tools/build-critical.py

That pulls real rules out of `assets/site.css` in source order, so the cascade
still applies and the two copies cannot drift from the sheet. It writes between
the `<!--critical:start-->` and `<!--critical:end-->` markers in `index.html`
and `mappr/index.html`. Change what counts as critical by editing the selector
lists at the top of the script, then re-run it.

Re-run it after any change to the rules it covers, or the pages will paint
with stale values above the fold.

## The band

Settled 23 September 2026, on board 14 of the brand book. One row of the field,
fired, under the bar on every page, in the colours of whoever owns the page.
The house band is all six glazes, each motif in its owner's colour (Mappr the
quarter disc in yellow, Flowr the pinwheel in blue, Docr the half disc in
green), so it is the index laid out as tiles. A tool's band is that tool's one
glaze and one motif, solid and open alternating.

    python3 tools/build-band.py

writes the band between `<!--band:start-->` and `<!--band:end-->` in both pages,
and `assets/tiles.svg`, the one sprite the band, the plate and the house page's
drawn cards all use. `tools/glaze-lib.json` holds board 07's six glazes, lifted
from the book. It fires once on load, left to right, and a tile lifts and turns
under the cursor. Nothing moves at rest.

## The cards are keys

Settled 23 September 2026, on board 15. The tool cards on the house page sit on
a skirt in the tool's accent: they rise under the cursor and go down when
pressed. Mappr's grows a little branch out of Open Mappr; Flowr's pinwheel goes
round; Docr's half disc comes up. A tool that is not built jams instead of going
down and says so, with a link to ask for it (`assets/keys.js` is only there
because a phone does not focus a button it taps). Rule cards are not
clickable, so they stay straight and only stamp their number as a tile. The
link cards are drawn in their own colour and each icon has one small trick.

## The Open Mappr transition

Settled 23 September 2026, on board 16. Pressing Open Mappr drops a plate of
Mappr's glaze out of the band, 45ms a row away from it and 8ms a column away
from the button, holds 300ms, and goes to `/mappr/app#glaze=<x>,<y>`, where
`<x>,<y>` is the band's offset, so the app can lay the identical plate and roll
it back up once the map has drawn. `assets/mappr-open.js`. The tiles are
`p-<motif>` in `assets/tiles.svg`, taken from the button's `data-plate`, Mappr's
quarter disc by default, so Flowr gets its own plate with nothing else to change.

With JS off the link is an ordinary link, and reduced motion goes straight
through.

## Open

As of 23 September 2026. The brand book's own list is on its Next steps page;
this is what is open about the site.

**arghtools.com does not point here.** It serves a GoDaddy Website Builder
holding page. The site is live at `arghtools.vercel.app`. To connect it:
unpublish the GoDaddy site and clear any domain forwarding first, or its DNS
keeps overriding; add `arghtools.com` and `www` in the Vercel project's
Domains settings; put the A and CNAME records it gives you into GoDaddy's DNS.
Do not move the nameservers if there is any mail on the domain, or the MX
records go with them.

**`/mappr/app` may be redirecting rather than proxying.** A fetch came back as
a cross-host redirect to `mappr-9v19.vercel.app` instead of serving the app
under this origin. Unconfirmed. Open it and watch whether the address bar
changes. If it redirects, the shared origin the route was built for does not
exist, and the storage note below stops mattering.

**Browser storage is per origin.** Maps made on `mappr-9v19.vercel.app` do not
follow the app to `/mappr/app`. Unsolved, and it decides whether the move can
be made quietly.

**The retract is only half built.** The site drops the plate and hands the app
`#glaze=<x>,<y>`. Until the Mappr app paints the same plate on its first frame
and rolls it up, the plate still disappears the moment the app loads.

**The pinwheel reads as a bow-tie at keycap size.** It is two opposite blades
in board 07's own drawing. Flowr owns that motif, so it matters before Flowr
ships.

**The inversion has no second half.** The hero runs `Less argh.` plain rather
than inventing a pairing. The house page is the surface that most deserves
one.

**The Mappr page is 58KB** and still carries large inline SVGs for the map
demos, which is the weight problem the house page had before the ceramic field
moved out to its own asset.
