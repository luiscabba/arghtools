# arghtools

The site for **Mappr by ARGH!**, at arghtools.com.

Plain HTML and CSS. No framework, no build step, no dependencies. Vercel serves
the folder as it is, which is the same idea the app itself is built on: one file
that opens and works.

```
index.html                       the house page, ARGH! at the root
404.html                         the house's not-found page, served by Vercel for any missing route
mappr/index.html                 the Mappr page
assets/site.css                  tokens, layout, the whole system
assets/tiles.svg                 the band, plate and drawn-card sprite (tools/build-band.py)
assets/mappr-demo.js             the looping map panel in the Mappr hero
assets/mappr-open.js             the Open Mappr plate
assets/navband.js                fits the run of tiles in the bar to whole tiles
assets/keys.js                   lets a phone show why an unbuilt tool will not open
assets/hero-light.js             lights the hero's motifs round the cursor
assets/seams.js                  moves the house page's seams while you scroll
assets/hero-field.svg            the house hero's keycap field (tools/build-hero.py)
assets/fonts/                    Bricolage Grotesque 800, IBM Plex Sans and Mono
assets/Excalifont-Regular.woff2  the map's hand-drawn face (SIL OFL 1.1)
assets/icon.svg                  the Mappr page's favicon: Mappr's tile, its mark since 1.12.0
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
| anything else | ARGH! | `404.html`, the house's not-found page |

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

## Light the field

Settled 23 September 2026, on board 17. Every key in the house hero holds a
motif; the cursor lights the ones around it (85 percent, the ring beyond at
42, a third of that behind the type) and they go out after a short stepped
linger. Keys with a resting motif keep it. `tools/build-hero.py` deals the
motifs with their own seed, so the resting field never changes, and writes
them inline between `<!--light:start-->` and `<!--light:end-->`;
`assets/hero-light.js` places and lights them. Mouse and trackpad only: touch
and reduced motion get the resting field.

## Keeping it fast

Checked 23 September 2026. The house page is about 116KB over 13 requests and
paints in about a fifth of a second; the Mappr page about the same.

- Every hand-drawn path is written compactly by `tools/compact.py`: one M,
  then relative steps, no repeated L. Same pixels, about 40 percent fewer
  bytes. `build-hero.py` and `build-band.py` run it on what they write.
- The map demo in the Mappr hero only runs while it is on screen and the tab
  is in front, and reads its size only when the size changes.
- `vercel.json` caches the fonts for a year and the other assets for a day,
  served stale for a week while they refresh, since their names do not change
  when their contents do.

## Critical CSS

All three pages carry an inlined block of critical CSS so a late stylesheet costs
polish rather than the whole design. It is generated, not hand-written:

    python3 tools/build-critical.py

That pulls real rules out of `assets/site.css` in source order, so the cascade
still applies and the two copies cannot drift from the sheet. It writes between
the `<!--critical:start-->` and `<!--critical:end-->` markers in `index.html`
`404.html` and `mappr/index.html`. Change what counts as critical by editing the selector
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

writes the band between `<!--band:start-->` and `<!--band:end-->` in all three pages (the 404 wears the house's),
and `assets/tiles.svg`, the one sprite the band, the plate and the house page's
drawn cards all use. `tools/glaze-lib.json` holds board 07's six glazes, lifted
from the book. It fires once on load, left to right, and a tile lifts and turns
under the cursor. A beat after it has fired in, the wave (board 18) runs
through it once: each motif turns a full circle in eight clicks, left to
right, then the band settles for good. Nothing moves at rest.

## The bar in the band

Settled 23 September 2026, on board 19, tightened on board 20. The bar and
the band are one sticky row, 56px (48 on a phone): a tile bleeding off the
left, the wordmark on the ground with 14px either side and a solid tile beside
it, a run of whole tiles, the links as keys, a tile bleeding off the right.
Each link is drawn in its own colour and glazes solid under the cursor; on the
house The tools is yellow, What this is blue, Join green, and on Mappr every key
is yellow except ARGH!, which is ink, with Open Mappr already glazed. Mappr's
wordmark is just its name. No page has the rainbow stripe any more.

The run of tiles is always a whole number of tiles, so nothing is cut against a
key; `assets/navband.js` trims it and hands the few pixels left over to the keys.
On a phone the half tiles at the edges go, the run stays, and the links take
short labels. `tools/build-band.py` writes the whole row.

## The cards are keys

Settled 23 September 2026, on board 15. The tool cards on the house page sit on
a skirt in the tool's accent: they rise under the cursor and go down when
pressed. Mappr's grows a little branch out of Open Mappr; Flowr's pinwheel goes
round; Docr's half disc comes up. A tool that is not built jams instead of going
down and says so, with a link to ask for it (`assets/keys.js` is only there
because a phone does not focus a button it taps). Rule cards are not
clickable, so they stay straight; their number is drawn by hand (see The seams
and the rule cards). The
link cards are drawn in their own colour and each icon has one small trick.

A phone cannot hover, so on a touch screen a card is selected instead: tapping
one gives it everything the cursor would (the glazing edge, the icon's trick),
one card at a time, until you tap somewhere else. A card that is a link goes on
the second tap, so the trick is seen first; the unbuilt tools light up and jam
on the same tap; a rule card toggles. Buttons and the nav keys are not cards and
act on the first tap. `assets/keys.js`, `.is-sel` in `assets/site.css`.

## The seams and the rule cards

Settled 24 September 2026, from the scroll mockup. Below the hero the house
page was flat and tight, so:

- **Roomy.** Sections sit 110px apart against a seam and 132 above the shelf
  (desktop only; the phone spacing is unchanged). Headings are 54px.
- **Dot paper.** The page ground below the hero is a faint dot on the 68
  module, where the Mappr page has its grid. The hero keeps the keycap field.
- **Seams.** One row of tiles between each pair of sections after the shelf
  and above the footer: the band repeated down the page. None under the hero,
  because the band is right above it. Mostly open glazes at 22 percent, about
  one in eight solid, one in ten empty. On a tool's page they would be that
  tool's glaze and motif only.

      python3 tools/build-seams.py

  writes them between `<!--seam:start-->` and `<!--seam:end-->` in
  `index.html`, dealt with a fixed seed. The tiles are in the markup, so the
  seams are there without any script. `assets/seams.js` moves them: a seam
  fills in left to right the first time it is seen, slides sideways as you
  scroll (alternate seams the other way), about a quarter of its tiles spin at
  their own speed and direction, and one solid glaze runs along it. A tile
  lifts and turns a quarter under the cursor, as in the band. Reduced motion
  gets the still seams.
- **Numeral rule cards.** Each rule card carries its number drawn by hand,
  big, bleeding off the top right corner, in the card's glaze (orange, red,
  violet: the three motifs no tool owns), with a run of three small tiles top
  left. The hand is an SVG turbulence displacement on the display face, a
  second thinner pass at half opacity, three frames. Under the cursor, or
  when a phone selects the card, the frames cycle and the number fills.

**The motion rule.** Movement tied to the scroll eases, because stepped
movement tied to the scroll reads as lag. Everything you hover or press stays
stepped, like the rest of the site. Nothing moves at rest.

## The launch line

Settled 24 September 2026. For the launch, the house page's title and its
link card say **Less noise.**, a campaign line (brand book board 02: temporary,
retires with the campaign, never promoted). The house line stays **Less argh.**
everywhere else. The card is `assets/og-house.png`, 1200 x 630, drawn in the
social kit (board 33). When the launch ends, the title and the card go back
to the house line.

## The marks

Settled 23 September 2026, on book board 30. ARGH! has two marks, both in
`assets/brand/`, drawn once and only ever scaled:

- **The stamp** (`argh-stamp*.svg`): A! cut through a tile. The everyday mark: the
  tab, profile pictures, the app icon, the footer. Ink on the house; it can wear any
  of the seven glazes (one file each, same outline), and on a tool's page the
  made-by credit wears that tool's glaze. The house page's favicon and
  apple-touch-icon are the stamp.
- **The burst** (`argh-burst.svg`): red, yellow, blue and green strokes out of one
  ink dot. Only where the volume is allowed up: launch day, the house post,
  stickers, the 404. Never recoloured, never in a tab, never below 24px.
  It is also the social profile picture on every platform, without its tile
  (`argh-burst-open.svg`, the same drawing with the dark tile removed), sitting
  straight on the circle (brand book board 33, 24 September 2026).

On the house page the stamp sits in the footer beside the wordmark, at its cap
height (34px) with half a mark of clear space (board 31, F1). `404.html` is
the burst's first use on the site: the burst at 200 (160 on a phone), then
`Argh!` at hero size, `Nothing lives at this address.` and a way back to the
shelf (board 31, N2). It wears the house band and footer, and its keys point
at `/#index`, `/#rules` and `/#join`.

PNGs at the usual sizes are in `assets/brand/png/`. A tool's own page keeps the
tool's mark as its icon: `mappr/index.html` points at `assets/icon.svg`, which
since Mappr 1.12.0 is Mappr's tile (brand book board 22 A); the brace is retired.

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

**The hero demo still eases.** `assets/mappr-demo.js` glides its camera and
its nodes, while the app it shows moves in steps since 1.12.0.

**The pinwheel reads as a bow-tie at keycap size.** It is two opposite blades
in board 07's own drawing. Flowr owns that motif, so it matters before Flowr
ships.

**The inversion has no second half.** The hero runs `Less argh.` plain rather
than inventing a pairing. The house page is the surface that most deserves
one.

**The Mappr page is 58KB** and still carries large inline SVGs for the map
demos, which is the weight problem the house page had before the ceramic field
moved out to its own asset.
