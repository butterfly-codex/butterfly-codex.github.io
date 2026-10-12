# 蝶谱 · The Butterfly Codex

A bilingual (中文 / English) illustrated codex of 112 butterfly taxa and 220 specimens,
built from the original photographic plates in the parent folder and the September 2025
supplement in `0918蝴蝶图片更新/`. Each entry carries a
classification block, a diagnosis, habitat and life-history notes, and a verbatim
transcription of the caption printed on the plate it came from.

## Viewing it

Open `index.html` — double-clicking works, no server needed (all data is in `data.js`,
nothing is fetched at runtime). To serve it instead:

    python3 -m http.server 8000     # then open http://localhost:8000

## What's here

    index.html   markup
    style.css    all styling, both themes
    app.js       filtering, routing, i18n, the detail panel
    data.js      the catalogue (window.CODEX) — accounts, taxonomy, realms, front matter
    img/         220 specimens × 2 sizes, background removed (WebP with alpha)

## How to use it

- **中文 / EN** in the header switches every label and every description.
- **Search** matches Chinese names, English names, scientific names and countries.
  Press `/` to jump to the box.
- **Filter** by family group (闪蝶 / 灰蝶 / 蚬蝶 / 眼蝶 / 蛱蝶 / 凤蝶) and by biogeographic realm
  (Neotropical, Nearctic, Palearctic, Oriental, Afrotropical, Australasian).
- **Click any specimen** for the full entry. Species photographed more than once show a
  thumbnail strip — usually the upper and under sides, or several subspecies.
  `←` `→` move between species, `Esc` closes, and every entry has its own URL (`#/achilles`).
- Inside an entry, **"Show the other language"** appends the whole account in the other
  language, so the two can be read against each other.
- **About** (header) covers how the plates were processed, why there is no colour filter,
  the classification followed, and what is primary source versus editorial apparatus.
- The sun/moon button switches theme. Language and theme are remembered.

## Two tiers of information

Every entry separates its sources:

- **图版原注 / As captioned on the plate** is a faithful transcription of the original
  plate caption. It is the primary source for this collection and is quoted as such.
- Everything else — authority, type locality, wingspan, hostplant, habitat, remarks —
  is apparatus compiled from general lepidopterological reference knowledge. It has *not*
  been checked line by line against original descriptions, and wingspans are approximate
  unless the plate gave a figure. Check it against a nomenclator (Lamas 2004 for the
  Neotropics; FUNET or LepIndex online) before citing any of it formally.

Five taxa carry no scientific name because the plate gave only a Chinese one; they are
labelled as such rather than identified speculatively. Where the plate's own reading looks
doubtful — `aegai` for *aega*, `Maculinea arionidas` for *Phengaris arionides*, Staudinger
"1980" for 1890 — the plate is quoted as-is and the discrepancy is noted under Remarks.

## Why there is no colour filter

In *Morpho* and much of the Lycaenidae the blues, violets and golden greens are structural,
produced by interference in the multilayered ridges of the wing scales rather than by
pigment. Apparent hue therefore shifts with viewing angle, with the position and colour
temperature of the light, and with polarisation — the same specimen photographs as two
different colours under two lighting setups. Colour as recorded by a camera is not a
reliable character, so browsing is by realm and family instead.

## Regenerating from the plates

The pipeline lives in `../tools` and runs against the plates in the parent folder:

    python3 tools/detect.py *.jpg > tools/boxes.json   # locate specimens on each plate
    python3 tools/extract.py                           # crop + key out the grey ground
    python3 tools/build.py                             # measure colour, emit site/data.js

`detect.py` separates specimens from the captions printed on the plates by saturation —
the type is pure neutral black, every specimen carries colour. All species text lives in
`tools/catalog.py`, including the group essays and the About front matter; edit it there
and re-run `build.py`. `build.py` still samples an accent colour per specimen, but it is
used only to tint a card's hover glow — it is not a classification.

Note: `2.jpg` and `45.jpg` are Photoshop files with a `.jpg` extension. They are converted
to `tools/src/` first with `sips -s format jpeg`.

## The September 2025 supplement

`0918蝴蝶图片更新/` holds 30 phone screenshots — mostly social-media posts, several credited
"Image Hans Collection." or carrying an account watermark — that add 46 entries (swallowtails
and apollos, Callicore, Agrias hybrids, Euphaedra, more lycaenids) and 140 specimens. They have
their own detector and extractor because the sources carry app chrome, captions in varying
places, watermarks and cast shadows:

    python3 tools/detect_0918.py                       # boxes (per-file regions / grids) -> tools/boxes_0918.json
    PYTHONPATH=tools python3 tools/extract_0918.py     # cut out + matte -> site/img/IMG_*.webp, tools/manifest_0918.json
    python3 tools/build.py                             # merges both manifests

The entries live in `tools/catalog_0918.py`; their "plate" field transcribes the post's own
caption, credit line included. In the site these shots are labelled "Supplement 0943" and so
on. `IMG_0952.PNG` is text only (it continues the Jamides caption in `IMG_0951.jpg`). The
extractor writes all 161 detected specimens; the unused ones (a Jamides plate with 42 small
specimens, of which only the cleanly separated ones are used, and a duplicate on `IMG_0966`)
are removed from `site/img/` afterwards.

## Corrections (September 2025 audit)

- Many original plates reprint photographs from earlier plates (17 repeats 1 and 3, 46–48 repeat
  11–12, 71–79 repeat 13–30, and so on). Each specimen is now shown once; the 32 repeats were
  removed from the `imgs` lists in `tools/catalog.py`.
- Plates 4 and 16 caption a pale silvery-turquoise morpho as *Morpho achilles*. It does not match
  that species, so it has its own entry (`morpho-captioned-achilles`) with the plate caption quoted
  and the discrepancy explained.
- Pale wings that matched the grey ground had pinholes keyed out of them, which showed as black
  spots on the dark theme. `tools/fill_holes.py` closes small enclosed holes; `extract.py` now
  calls it, and it was run once over the existing images.

