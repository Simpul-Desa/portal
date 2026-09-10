---
version: alpha
name: SimpulDesa-design-system
description: |
  A geospatial monitoring system for SIMPUL DESA (Sistem Intelijen Potensi dan Kesiapan Ekonomi Desa). The map is the stage; everything else is quiet chrome arranged around it. There is no white in this system — hierarchy is built from five closely-spaced gray levels (#dcdcdc canvas, #ededed rail, #f5f5f5 panel card, #f7f7f7 floating surface, #fcfcfc inset) so that satellite imagery stays the brightest, most saturated thing on screen. Ink is a soft charcoal (#323232), never pure black. Orange (#ff7300) is the single voltage color, spent on one primary action per screen and on map highlights; green, amber, and red are reserved strictly for data status and never used decoratively. Numbers are the hero: large metric figures sit above small gray labels inside tightly-packed cards separated by 8px gutters. Corners are 16px on cards, 12px on inset blocks, fully round on top-bar controls. Shadows exist only on elements that genuinely float over the map.

colors:
  # Neutrals — the five-level ladder. Order matters: each step is deliberately small.
  canvas: "#dcdcdc"
  rail: "#ededed"
  surface: "#f5f5f5"
  surface-float: "#f7f7f7"
  surface-inset: "#fcfcfc"
  surface-dark: "#323232"
  hairline: "#ececec"
  border: "#e4e4e4"
  border-strong: "#c3c3c3"

  # Text
  ink: "#323232"
  body: "#595959"
  muted: "#767676"
  muted-sampled: "#909090"
  disabled: "#b0b0b0"
  on-dark: "#ffffff"
  on-dark-muted: "rgba(255,255,255,0.70)"
  on-primary: "#323232"

  # Action
  primary: "#ff7300"
  primary-active: "#e46700"
  primary-soft: "#ffe4cc"

  # Status — data only, never decoration
  positive: "#31a863"
  positive-deep: "#2c905a"
  positive-bright: "#33b167"
  caution: "#e8b348"
  critical: "#e05048"

  # Data visualisation
  ramp-1: "#e15848"
  ramp-2: "#e26a48"
  ramp-3: "#ebb568"
  ramp-4: "#7ed19f"
  ramp-5: "#2c905a"
  chart-fill-positive: "#dde9e2"
  chart-fill-warm: "#f4efe5"
  chart-grid: "#e4e4e4"

  # Map overlay
  map-outline-selected: "#ffffff"
  map-outline-alt: "#ff7300"
  map-fill-selected: "rgba(255,255,255,0.10)"
  map-fill-alt: "rgba(255,115,0,0.18)"
  map-outline-idle: "rgba(255,255,255,0.4)"
  map-fill-idle: "rgba(255,255,255,0.06)"
  map-marker: "#2e5aac"
  map-gold-outline: "#d9a13b"
  map-gold-fill: "rgba(217,161,59,0.20)"

  # Zone choropleth — Peta Peran (added 9 September 2026). Bivariate:
  # hue marks which axis is high. Map content only, never chrome.
  map-zona-pemerintah: "#d6338f"
  map-zona-mitra: "#7d5ae0"
  map-zona-poros: "#00a9bf"
  map-zona-bantuan: "#8d9aab"
  map-zona-belum: "rgba(255,255,255,0.75)"

  # Interaction accents
  focus: "#0d8a7e"
  link: "#0c7d72"

  # Overlay — the only scrim in the system, added 9 September 2026 with the
  # dialog spec. Derived from surface-dark, not a new hue.
  scrim: "rgba(50,50,50,0.32)"

typography:
  metric-xl:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 44px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.8px
  metric-lg:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.5px
  metric-md:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.3px
  title-lg:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.2px
  title-md:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  title-sm:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  metric-unit:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0
  badge:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0
  micro:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: 0
  button-md:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0
  mono-id:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  none: 0px
  xs: 6px
  sm: 10px
  md: 12px
  lg: 16px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  gutter: 8px
  sm: 12px
  md: 16px
  card: 20px
  lg: 24px
  xl: 32px

elevation:
  flat: "none"
  float: "0 4px 16px rgba(0,0,0,0.12)"
  float-strong: "0 8px 28px rgba(0,0,0,0.18)"

layout:
  rail-width: 64px
  panel-width: 480px
  panel-min-width: 400px
  panel-max-width: 640px
  assistant-width: 380px
  card-gutter: 8px
  map-control-size: 44px

components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
    border: none
    shadow: "{elevation.flat}"
  card-float:
    backgroundColor: "{colors.surface-float}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
    shadow: "{elevation.float}"
  card-inset:
    backgroundColor: "{colors.surface-inset}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  card-quadrant:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    divider: "1px solid {colors.hairline}"
    cellPadding: "{spacing.card}"
  panel-insight:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "0 18px"
    height: 40px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.surface-float}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "0 18px"
    height: 40px
  button-icon:
    backgroundColor: "{colors.surface-float}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 40px
  map-control:
    backgroundColor: "{colors.surface-float}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    size: "{layout.map-control-size}"
    shadow: "{elevation.float}"
  status-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
    dotSize: 6px
  search-field:
    backgroundColor: "{colors.surface-float}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.muted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    height: 44px
    padding: "0 16px"
    shadow: "{elevation.float}"
  status-cap:
    height: 6px
    rounded: 2px
    positive: "{colors.positive-deep}"
    caution: "{colors.caution}"
    critical: "{colors.critical}"
    shape-positive: solid
    shape-caution: "solid with a 2px notch cut from the centre"
    shape-critical: "two stacked 2px bars with a 2px gap"
  progress-bar:
    trackColor: "{colors.border}"
    fillColor: "{colors.positive}"
    height: 6px
    rounded: "{rounded.full}"
  ramp-meter:
    tickWidth: 3px
    tickGap: 2px
    height: 36px
    markerColor: "{colors.ink}"
    markerWidth: 2px
  matrix-table:
    headerBackground: "{colors.surface-inset}"
    rowHeight: 44px
    rowDivider: "1px solid {colors.hairline}"
    typography: "{typography.body-md}"
    headerTypography: "{typography.label}"
  twin-compare:
    columnGap: "{spacing.md}"
    deltaPositive: "{colors.positive}"
    deltaNegative: "{colors.critical}"
    rowDivider: "1px solid {colors.hairline}"
  tooltip:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  form-field:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.muted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 44px
    padding: "0 12px"
    border: none
    shadow: "{elevation.flat}"
  form-label:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    gapBelow: "{spacing.xs}"
  form-error:
    textColor: "{colors.ink}"
    typography: "{typography.micro}"
    dotColor: "{colors.critical}"
    dotSize: 6px
    gapAbove: "{spacing.xs}"
  form-hint:
    textColor: "{colors.muted}"
    typography: "{typography.micro}"
    gapAbove: "{spacing.xs}"
  notice-block:
    dotColor: "{colors.critical}"
    dotSize: 6px
    titleTypography: "{typography.title-sm}"
    bodyTypography: "{typography.body-md}"
    codeTypography: "{typography.micro}"
  dialog:
    backgroundColor: "{colors.surface-float}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
    shadow: "{elevation.float-strong}"
    maxWidth: 380px
    scrim: "{colors.scrim}"
  chip-filter:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.body}"
    rounded: "{rounded.full}"
    height: 32px
    padding: "0 12px"
    typography: "{typography.label}"
    dotSize: 6px
  chip-filter-active:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
  map-route:
    lineColor: "{colors.map-gold-outline}"
    lineWidth: 2px
    lineOpacity: 0.85
    porosCircleColor: "{colors.surface-float}"
    porosStrokeColor: "{colors.map-gold-outline}"
    porosStrokeWidth: 2px
    porosRadius: 7px
    anggotaRadius: 4px
---

## Overview

SIMPUL DESA is a monitoring surface, not a marketing surface. Every visual decision below serves one goal: let the operator read the state of many villages quickly, with the map carrying the spatial story and the panel carrying the numeric one.

Two audiences share one shell:

- **Public dashboard** — view-only. Same four-column shell, same cards, no action buttons, no assignment controls.
- **Authenticated workspace** — the same screens plus per-role actions (assignment, editing, export).

The design does not fork for these. Actions appear or disappear; the layout does not change.

## Colors

### The gray ladder

This system has **no pure white surfaces**. Pure `#ffffff` appears only as text on dark blocks and as the selected-area outline on the map. Surfaces step in narrow increments so the satellite imagery is always the brightest thing on screen:

| Token | Value | Where |
|---|---|---|
| `canvas` | `#dcdcdc` | Page background and the 8px gutters between cards |
| `rail` | `#ededed` | Left icon rail |
| `surface` | `#f5f5f5` | Cards inside the data panel |
| `surface-float` | `#f7f7f7` | Anything floating over the map: search field, buttons, detail card |
| `surface-inset` | `#fcfcfc` | Blocks nested inside a floating card (sensor readouts, sub-tables) |
| `surface-dark` | `#323232` | Insight panels and tooltips — the only dark blocks |

Floating surfaces are *lighter* than panel cards, not darker. That inversion is what makes them read as lifted without a heavy shadow.

### Text

`ink` `#323232` for headings and metric figures — a soft charcoal, never pure black. `body` `#595959` for values inside lists. `muted` `#6b6b6b` for field labels and placeholders. `disabled` `#b0b0b0`.

On `surface-dark` blocks the primary text is `on-dark` `#ffffff`, and its secondary tier is `on-dark-muted` `rgba(255,255,255,0.70)` — added 9 September 2026 for the labels under the coverage figures on the sign-in screen. `muted` is not the fallback there: on `#323232` it stops being text. Every gray in this system belongs to one ground; none of them travel.

`muted` is the one token that deliberately departs from the reference. Sampling the source gives `#909090`, which measures 2.9:1 on `surface` — well under the 4.5:1 WCAG AA floor, and labels are the text a monitoring tool is read through. `muted-sampled` `#909090` stays documented for anyone comparing against the reference; use it only for non-text marks — tick marks, dividers, decorative glyphs.

**Corrected 10 September 2026.** This section previously shipped `muted` as `#767676` and recorded it as "4.5:1". That figure was measured against pure white — a ground this system does not have, by its own rule stated under the gray ladder. Against the surfaces `text-muted` is actually painted on, it fails AA everywhere: `inset` 4.43, `float` 4.24, `surface` 4.17, `rail` 3.88, `canvas` 3.31. The token is now `#6b6b6b`, which clears AA on all four **card** surfaces — `inset` 5.19, `float` 4.97, `surface` 4.89, `rail` 4.55 — and still measures 3.89 on `canvas`.

That last number is a rule rather than a colour: **`muted` text never sits directly on `canvas`.** Outside a card, use `body` `#595959` (5.11 on `canvas`, safe on every ground in the ladder). Two places broke this before the correction — the pager footnote in the Peta Peran panel and the ranked-cell footnote in Citra Potensi Desa, both rendering `micro` `muted` as bare panel children. A label needs a card under it; if there is no card, the label is the wrong tier.

`disabled` `#b0b0b0` and `faint` grays never carry text a user must read. They mark absence (an empty matrix cell, an inactive control), and absence does not need to pass contrast.

### Orange is a budget

`primary` `#ff7300` is the only voltage in the system. Spend it on **one** primary action per screen, plus map highlight outlines for non-selected areas of interest. An interface with two orange buttons visible at once is a bug.

The hue is sampled from the WSO2 API Manager documentation palette, where the same orange carries an entire product surface without ever becoming decoration. `primary-active` `#e46700` is sampled from that source too, not derived.

**Text on `primary` is `ink` `#323232`, never white.** Charcoal on this orange measures 4.70:1 and passes WCAG AA for normal text; white on the same orange measures 2.73:1 and fails. There is nothing lost by the swap: the source palette uses its orange as a foreground color on light surfaces — link text, icon strokes, a 4px accent rule — and never as a button fill carrying white text. Every text/background pair in this file now passes AA, and any new one must.

### Interaction accents

Added 8 September 2026 — teal family from the WSO2 Identity Server visual
language, navy and gold from the agritech field-monitoring reference pins.

- `focus` `#0d8a7e` — the focus ring: 2px ring at 2px offset on every
  focusable element. Measures 3.9:1 on `surface`, passing the 3:1 WCAG
  non-text floor. This resolves the focus-ring gap; hover stays per
  component (single-step surface lift).
- `link` `#0c7d72` — inline text links only. 4.6:1 on `surface`, passing
  AA for normal text. **Underlined whenever it sits inside a block of
  text** (added 10 September 2026, caught by Lighthouse): against the
  surrounding `muted` copy the link colour measures 1.06:1, far under the
  3:1 that colour alone would need to distinguish a link from the prose
  around it, so the underline is the non-colour signal that does the work.
  This was already true before `muted` was retuned — the old value measured
  1.10:1 — so it is a pre-existing gap the retune merely nudged. A link that
  stands alone as its own control needs no underline from this rule, and the
  Berita Desa headline is exempt because its trailing external-link icon is
  already a non-colour signal.
- Teal is interaction, never status and never a button fill — `primary`
  orange remains the only action color, and its budget is unchanged.

**One ring, two variants** (added 10 September 2026). Most controls take the
ring on `:focus-visible`, so it appears for keyboard navigation and not on
every mouse click. Form controls are the exception: focus lands on the
`<input>` or `<select>` while the ring belongs on the **wrapper** that draws
the field, so those take the same utilities under `:focus-within`. Both live
as named constants in one module (`FOCUS_RING`, `FOCUS_RING_WITHIN`) rather
than as strings copied per component — four hand-written copies had already
drifted apart before they were consolidated.

The behavioural difference is real and intended: `focus-within` fires on
mouse click too, so clicking into a search field shows the ring while
clicking a button does not. A field is a place you are *in*; a button is
something you *hit*.

### Status colors are data, not decoration

`positive` `#31a863`, `caution` `#e8b348`, `critical` `#e05048`. These appear on progress fills, chart caps, delta figures, and status dots. They never become a background for a whole card, never tint a button, never mark a nav item.

**And they never carry text at badge size** (added 10 September 2026). The recommendation badge on Rekomendasi Aksi shipped as white on `positive-deep` `#2c905a`, which measures 4.00:1 — under AA for its 11px `badge` type, and 11px is not large text, so no size exemption applies. `ink` on the same green is worse at 3.20:1, so there is no text colour that rescues a `positive-deep` fill at this size.

The fix is the pattern this system already has rather than a new token: **colour rides a 6px dot, the words stay in whatever text tier the ground calls for** — the same rule already stated for `form-error` and for `caution`/`positive` as text. Darkening `positive-deep` was rejected because that token also serves as a chart fill, where nothing is wrong with it; moving one token to rescue one badge drags the healthy uses along.

The ground decides the rest, and this badge is the case that proves it. On a light card the dotted marker takes `status-chip` geometry — `surface-inset` ground, words in `ink`. But this particular badge lives inside `panel-insight`, the one dark block on the screen, where a near-white pill would instantly become the brightest thing in view and pull the eye to a provenance label. So there it takes no fill at all: words in `on-dark` white (12.82:1 on `deep`) with the `positive` dot beside them (4.22:1 on `deep`, well past the 3:1 non-text floor). Same rule, two grounds, no new token — and never a coloured fill carrying badge-size text on either.

### Data visualisation

The five-stop ramp `ramp-1` → `ramp-5` (`#e15848 → #e26a48 → #ebb568 → #7ed19f → #2c905a`) is the readiness scale used by the ramp meter and by any heatmap-style encoding. It runs red (unready) to green (ready) and is the *only* sanctioned multi-color scale. Chart area fills use the desaturated `chart-fill-positive` / `chart-fill-warm`; grid lines use `chart-grid`.

## Typography

Geist (already loaded via `next/font`) with Geist Mono for identifiers. Weights stay at 400 and 500 — this system never goes bold.

The hierarchy is deliberately steep: a metric figure at 44px sits directly above a 13px gray label. That 3× jump, not weight or color, is what makes numbers scan.

- `metric-xl` 44px/500 — the headline figure in a quadrant cell or entity header
- `metric-lg` 32px/500 — secondary figures, comparison columns
- `metric-md` 24px/500 — figures inside dense tables
- `title-lg` 20px/500 — the entity name in `card-entity`, the one title that outranks a card title
- `title-md` 16px/500 — card titles
- `metric-unit` 22px/500 — the unit suffix riding on a `metric-xl` figure (`68` + `%`)
- `body-md` 14px/400 — list values, table cells
- `badge` 11px/500 — the letters inside a badge chip
- `label` 13px/400 `muted` — field labels above every metric
- `micro` 12px/400 `muted` — Max/Min pairs, axis ticks, scale bars
- `mono-id` 13px — village codes, assignment IDs (`#23BC-12` style)

There are exactly eleven text sizes. If a screen needs a twelfth, that is a signal the layout is wrong, not that the scale is short. Never write a one-off pixel size inline.

## Layout

### Four columns

```
╭──────╮  ╭────────────────────╮  ╭──────────────────╮  ╭───────────────────╮
│ rail │  │ left panel         │  │ map              │  │ assistant         │
│ 64px │  │ 480px default      │  │ rounded.lg block │  │ 380px             │
╰──────╯  │ 400–640, resizable │  │ fills the rest   │  │ closed by default │
          │ folds into rail    │  ╰──────────────────╯  ╰───────────────────╯
          ╰────────────────────╯
```
8px `canvas` gutter separates every block above, including the rail.

- **Rail** `64px`, background `rail`, now a rounded block (`rounded.lg`) like the other columns rather than an edge-to-edge strip. Icons only, 20px, `muted` at rest, `ink` when active with a `surface` pill behind them. Groups are separated by a short hairline, not a gap.
- **Left panel** `480px` by default (min `400px`, max `640px`), resizable by dragging its right edge — double-click the edge resets it to `480px` — and foldable away entirely into the rail (a button on the rail reopens it). Background `canvas`, scrolls independently. Contains a vertical stack of `card`s separated by exactly `8px`. Panel-level padding matches the gutter — cards sit `8px` from every panel edge.
- **Map** takes the remaining width and never scrolls — the only zone with saturated color. It is now a rounded block (`rounded.lg`) sitting in an `8px` `canvas` gutter on every side, not an edge-to-edge surface — the map is a peer of the other three columns, not their background.
- **Assistant panel (Asisten Desa)** `380px`, styled as a `card-float` — the same width tier as the map's detail popup. Closed by default; opens from a button at the top-right of the map, beside notifications. Opening it narrows the map column; it never overlaps the map.

The four-column shell — rail, resizable left panel, rounded map block, assistant panel — was approved by the user 8 September 2026 (PRD app §5.1). The left panel's `640px` maximum was set by the user the same day.

### Overlay positions on the map

- Top-left of map: back / context controls
- Top-center: `search-field`, wide, pill
- Top-right: `button-primary` + `button-secondary` + `button-icon`, in that order
- Right-center: `card-float` detail panel, max width `380px`
- Bottom-right: vertical stack of `map-control` buttons, `8px` apart
- Bottom-left: minimap thumbnail (`rounded.md`) with a scale bar beneath it

### Card rhythm

Cards are packed, not airy. `8px` between cards, `20px` padding inside them. When a card holds four related metrics, it uses one `card-quadrant` with a hairline cross rather than four separate cards — this is the system's most recognizable pattern.

**Vertical rhythm inside a card is two numbers, not a judgement call:**

- `16px` from a card title to the first block beneath it
- `12px` between sibling blocks inside the same card

Anything else is drift. If a block needs more air than `16px` — because a tooltip, badge, or overflowing label would otherwise collide — give that element its own reserved space (a fixed-height row above the block) rather than inflating the gap. Padding is for rhythm; it is not a collision fix.

## Elevation & Depth

Three levels only:

- `flat` — everything inside the data panel. Panel cards have **no shadow and no border**; the `canvas` gutter is what separates them.
- `float` `0 4px 16px rgba(0,0,0,0.12)` — anything sitting on the map.
- `float-strong` — modals and the active map detail card when it overlaps a bright imagery region.

Depth inside a floating card comes from `surface-inset` blocks and hairlines, never from a second shadow.

## Shapes

- `rounded.lg` **16px** — all cards, panels, insight blocks
- `rounded.md` **12px** — inset blocks, tooltips' larger siblings, minimap
- `rounded.sm` **10px** — map controls
- `rounded.full` — top-bar buttons, status chips, search field, progress fills

Hairline `#ececec` at 1px is the only divider. There are no 1px card borders anywhere in this system.

Icons: 1.5px stroke, `muted`, sized 16–20px, placed at the top-right of a metric cell rather than beside its label.

An icon that varies with data must actually vary. A weather row rendering the same glyph for rain, sun, and cloud is decoration wearing the costume of information — either map every state to its own glyph or drop the row.

## Components

Each spec covers Default and Active/Pressed. Hover behavior is not specified by this system — add it per component with a single-step surface lift (`surface` → `surface-float`) and no color change.

### Cards

**`card`** — the panel workhorse
- `surface` background, `rounded.lg`, `20px` padding, no border, no shadow.
- Stacked with `8px` gutters showing `canvas` between them.

**`card-quadrant`** — the signature metric block → **Kartu Potensi Desa**
- One `card` divided into 2×2 by a 1px `hairline` cross.
- Each cell: `label` top-left, thin icon top-right, `metric-xl` figure below, and an optional right-aligned Max/Min pair in `micro`.
- Use for four metrics that belong to one subject (e.g. potensi ekonomi, kesiapan SDM, akses pasar, infrastruktur). Do not use it for four unrelated numbers.

**`card-entity`** — the header card
- Title in `title-md` with a small map-pin icon beside it, subtitle `Desa • Kecamatan • Kabupaten` in `label` `muted`.
- Right side: one `metric-lg` figure with a delta beneath it (`↗ 12%` in `positive`, `↘` in `critical`).
- Always the first card in the panel; it establishes what everything below refers to.

**`card-float`** — the map detail panel → **Mesin Potensi Geospasial popup**
- `surface-float`, `rounded.lg`, `float` shadow, max width `380px`.
- Header: entity name in `title-md`, optional star, close button top-right; `mono-id` code beneath in `muted`.
- Body: paired label/value rows, then a `progress-bar` for a headline score.
- Collapsible sections use a `card-inset` block with a chevron in the section header.

**`card-inset`**
- `surface-inset`, `rounded.md`, `12px` padding. Only ever appears *inside* a `card-float`.

### Panel Insight

**`panel-insight`** — the dark recommendation block
- `surface-dark` `#323232`, white text, `rounded.md`.
- Header row: a `positive` badge (small, `rounded.xs`) reading the source, followed by the label in white.
- Body: one or two sentences of `body-md`. Keep it short; this block is the only dark thing on screen and it draws the eye hard.
- At most one per screen.

### Ramp Meter

**`ramp-meter`** — the readiness scale → **Skor Kesiapan Ekonomi Desa**
- A row of 3px vertical ticks with 2px gaps, 36px tall, colored across `ramp-1` → `ramp-5`.
- A 2px `ink` vertical marker sits at the current score position, full height.
- A `label` verdict sits right-aligned above the meter ("Siap dikembangkan", "Perlu intervensi").
- Beneath: a `card-inset` strip with a one-line projection and an optional badge.
- **Without a value it becomes a legend** — the tick row alone, no marker, no verdict, flanked by two `micro` end labels. Specified under Map Overlays → Score choropleth (Citra Potensi Desa); that is its only sanctioned use.

### Buttons

**`button-primary`** — `primary` background, `ink` text, `rounded.full`, 40px tall, `18px` horizontal padding. Leading `+` icon when the action creates something. Exactly one visible per screen.

**`button-secondary`** — `surface-float` background, `ink` text, same geometry. Export, filter, cancel.

On a `surface` card, `button-secondary` needs a boundary (added 10 September
2026). `surface-float` `#f7f7f7` on `surface` `#f5f5f5` measures 1.01:1 — the
pill shape that says "this is a button" is invisible, and the label alone is
carrying the affordance. That is tolerable in a toolbar and dangerous inside
a failure block, where "Coba lagi" sits one gap away from the machine code in
`micro` `muted` and the two read as the same kind of thing. So: **a
`button-secondary` on a card takes a 1px `line-strong` `#c3c3c3` ring**, and
keeps no shadow. This is not a reversal of "no borders on panel cards" — that
rule is about the cards, and a control is not a card. Four panel retry
buttons had already broken the no-shadow rule to become visible; the ring is
what they actually needed.

**Every text button holds its shape**: `shrink-0` and `whitespace-nowrap`, no
exceptions. A label that wraps inside a fixed 40px pill spills outside the
rounded shape — the same rule the map toolbar states under Responsive
Behavior, applied everywhere, because the failure is identical wherever a
40px pill meets a narrow column.

**`button-icon`** — 40px circle, `surface-float`, `ink` icon. Notifications, overflow menu.

**`map-control`** — 44px square, `rounded.sm`, `surface-float`, `float` shadow. Stacked vertically bottom-right with `8px` gaps: expand, zoom in, zoom out, locate, 2D/3D toggle.

### Tab Bar

Added 10 September 2026 with the Halaman Admin page (PRD app §5.7), the first
screen in this system divided into sections rather than lenses.

**`tab-bar`** — the section switcher
- A row of buttons 40px tall sitting on a 1px `hairline` that runs the full
  width of the row. `24px` between tabs.
- Active tab: `label` type in `ink`, with a 2px `ink` rule flush to the
  hairline beneath it. Resting tab: `label` type in `muted`, no rule.
- **It is not a `chip-filter`.** A tab moves you to another section; a chip
  narrows a list. The different shape is how the interface says which one it
  is, so a tab never takes the `primary-soft` tint — and the one-orange-action
  budget stays untouched, because a tab was never going to be that action.
- `role="tablist"` on the row, `role="tab"` with `aria-selected` on each
  button, `role="tabpanel"` with `aria-labelledby` on the panel, and
  `aria-controls` tying the two together. Left/right arrows move between tabs
  (roving `tabIndex`, so only the active tab is in the tab order), Home and End
  jump to the ends.
- Hover: `muted` → `ink` on the text alone. No surface change; there is no
  surface under a tab to lift.

### Status Chip

**`status-chip`**
- `surface` background, `rounded.full`, `6px 12px` padding, `label` type.
- A 6px dot leads the text: `positive` for active monitoring, `caution` for stale data, `critical` for an alert, `muted` for inactive.
- Used in headers ("3 desa dipantau") and inside matrix cells.

### Search Field

**`search-field`** — `surface-float`, pill, 44px, `float` shadow, leading magnifier icon in `muted`. Placeholder in `muted`. Sits top-center over the map.

### Form Controls

Added 9 September 2026 with the authentication screens (PRD app §5.6). These
close the Known Gap below; every value is drawn from tokens that already
existed. Two shapes, one rule: a field **over the map** is a `search-field`
(pill, floating, lifted); a field **inside a panel or card** is a
`form-field` (inset, square-cornered at `rounded.md`, flat).

**`form-field`** — the text input
- `surface-inset` background, `rounded.md`, 44px tall, `12px` horizontal
  padding, `body-md` text in `ink`, placeholder in `muted`.
- No border and no shadow. The inset surface is what separates it from the
  `surface` card it sits on — the same ladder logic as everything else.
- The focus ring belongs to the field wrapper, not the raw input: 2px
  `focus` at 2px offset, on `:focus-within`. The input itself carries no
  outline of its own.
- Disabled fields carry `disabled` text and keep the inset surface.
- **Multiline variant** (added 10 September 2026 with the Asisten Desa
  composer, PRD app §5.4): same `surface-inset` background and `rounded.md`
  corners, `10px 12px` padding, one line at the 44px minimum height, growing
  up to five lines and then scrolling. The focus ring belongs to the
  wrapper, exactly as with the single-line field.

**`form-select`** — the single-choice field, added 10 September 2026 with the
role control on Halaman Admin (PRD app §5.7)
- Geometry is `form-field`'s, unchanged: `surface-inset`, `rounded.md`, 44px
  tall, `12px` horizontal padding, `body-md` text in `ink`.
- A **native `<select>`** with `appearance-none` and a 16px `muted` chevron at
  the right edge, `pointer-events-none`. Native is the point: keyboard
  handling, screen-reader announcement, and the phone's own picker all arrive
  for free, and none of the three would be worth rebuilding for a field that
  offers four values.
- The focus ring belongs to the wrapper (`:focus-within`), exactly as with
  `form-field`. The select carries no outline of its own.
- While its request is in flight the field is disabled, its text is
  `disabled`, the inset surface stays, and the wrapper carries `aria-busy`.
- `form-label` is still required. A select whose only label is its own
  selected value cannot be checked, and it has no placeholder to fall back on.

**`form-label`** — always present, always above
- `label` type in `muted`, `4px` above its field, tied to the input by
  `for`/`id`.
- A placeholder is never a label. It disappears the moment someone types,
  and a form whose labels vanish while being filled cannot be checked.

**`form-error`** — one line beneath the field
- `micro` type in **`ink`**, led by a 6px `critical` dot.
- The sentence itself is never colored `critical`: at 12px that hue measures
  1.5:1 on `surface` (see Known Gaps). The color rides on the dot; the words
  stay readable. Same principle as `status-chip`.
- Error text says what to do next, not that something is invalid.

**`form-hint`** — `micro` in `muted`, `4px` beneath the field. Requirements
(password length, accepted format) live here, stated before submission
rather than after rejection.

Vertical rhythm inside a form follows the card rule already in Layout:
`16px` from the card title to the first field, `12px` between fields.

**`chip-filter`** — the single-select chip group, added 9 September 2026
with the Peta Peran zone filter (PRD app §5.3)
- At most one active chip per group: clicking a chip selects it within its
  group, and clicking the already-active chip again clears it back to no
  selection — this is a toggleable single-choice filter, not a multi-select
  tag picker.
- **Exception: the Jalur Ekonomi variant picker (PRD app §5.4) is not
  clearable.** It reuses this same `chip-filter` spec, but one of its four
  GLOSSARY variants is always selected — clicking the already-active variant
  chip is a no-op, not a clear. Clear-to-none is a property of the *zone*
  filter group specifically, not of every `chip-filter` group.
- Rest state: `surface-inset` background, `body` text. Active state:
  `primary-soft` background, `ink` text — a **tint**, not `primary` itself.
  The single-primary-action-per-screen budget (see Orange is a budget)
  stays untouched; a chip is never that one action.
- `rounded.full`, 32px tall, `0 12px` padding, `label` type.
- An optional 6px dot leads the text, carrying a category color (the zone
  hue, for instance) — this is what lets one chip group double as both a
  legend and a filter.

### Notice Block

Added 10 September 2026 for failures that must reach any user — signed-in
or anonymous — without inventing new copy or a new color. Two triggers
share one component (`BlokNotifikasi`): the session-role read failure
(PRD app §5.6), added first; and a server-disruption notice (server
unreachable or answering 5xx) on the two foundational region queries that
run for every visitor, added the same day once an anonymous visitor was
found to get zero notice at all when `api/` was down — the role query only
runs for a signed-in session. Same three lines everywhere: a 6px
`critical` dot leads a `title-sm` heading (the mapped `judul`), `body-md`
`pesan` beneath it in `ink`, then the raw `kode` in `micro` `muted` for
support reports. The `form-error` rule applies here too: color rides the
dot, the words stay `ink`. Text always comes from `pesanGalat`/
`pesanGalatAuth` — this block introduces no third mapping, only an
optional short hand-written line of context where the mapped text alone
would read as an accusation (e.g. telling a signed-in user their role
failed to load, not that they typed the wrong password). The
server-disruption trigger needs no such line — the mapped text already
states the failure plainly.

At most one instance renders at a time: when both triggers fire together
(the signed-in session's own role read has failed and would itself count
as a server disruption), the role-read notice wins, because it states the
sharper consequence — locked features, not just a stale panel.

Two placements, no new container:
- **Inline** — sits directly on whatever `card` or floating menu already
  hosts it (the auth forms' whole-form error, the account menu's sign-out
  failure). No background and no padding of its own.
- **Panel** — a standalone `card` (`surface`, `rounded.lg`, `20px`
  padding, no shadow — Elevation & Depth's "no shadow inside the data
  panel" applies) when the notice is not attached to any other block,
  such as the banner pinned above the left panel's content (both triggers
  above use this placement). A `button-secondary` labeled "Coba lagi" sits
  beneath the text and re-runs the failed read(s); nothing here reloads
  the page.

### Empty, Loading & Error States

Added 10 September 2026. Five surfaces had already specified all three
states one at a time — Asisten Desa, the Notice Block, Berita Desa, Laporan
Desa, and Halaman Admin — and five panels had grown their own hand-written
error card in the meantime, already drifting apart on whether the machine
code shows. This section promotes what those five surfaces agreed on into a
system rule. It introduces no token.

**The heading never disappears.** A section that vanishes when it has
nothing to show tells the reader the feature does not exist for their role,
which is a different and wrong answer. Loading, empty, and failed all render
*inside* the block that was going to hold the content, under the same
heading.

**Loading is shape, not words.** `animate-pulse` blocks at the height of the
content they stand in for, `aria-hidden`, no text and no spinner. Two blocks
is the default; a list that always shows more may use more. A skeleton is a
promise about layout — if the real content will be one row, do not draw
three.

**Empty is an answer, not an error.** One `body-md` `muted` sentence, no
`role="alert"`, no icon, no colour. It never apologises and it never blames
the reader. Where a filter is active, the sentence differs from the
no-data-at-all sentence: "nothing matches that search" and "there is nothing
here yet" are different facts, and collapsing them into one string hides
which of the two happened.

**Failure is the Notice Block shape**, in the placement that fits: *inline*
when it attaches to a card that already exists, *panel* when it stands alone.
A 6px `critical` dot leads a `title-sm` heading, `body-md` message beneath,
the raw `kode` in `micro` `muted`, and a "Coba lagi" button that re-runs the
failed read. `role="alert"` belongs here and only here. Two things are not
optional: the machine code always shows, because it is what a support report
is made of; and the words always come from the shared error mapping, because
a third mapping is how two screens start describing the same failure
differently.

**A fourth state exists and used to render nothing.** With the default
network mode, a fetch that starts while the browser is offline is *paused*,
not loading and not failed — so a panel branching loading → error → data
falls through all three and paints an empty rectangle. Paused takes the empty
state's shape with the failure state's retry: one sentence naming the lost
connection, one button. Any panel that can be opened offline needs this
branch, which is every panel.

**Announce the arrival, not just the failure.** A `role="status"` region,
visually hidden, mounted *before* its content changes — a region inserted at
the same moment as its text is not reliably announced. Errors already have
`role="alert"`; success had nothing, which meant a screen-reader user waited
through a silent skeleton and was never told the card had loaded.

### Dialog

**`dialog`** — the modal, first needed by the sign-in prompt (PRD app §5.6)
- `surface-float` background, `rounded.lg`, `20px` padding,
  `float-strong` shadow, max width `380px` — the same width tier as
  `card-float`, because it is the same kind of object: a surface lifted
  above everything else.
- Behind it, a full-screen `scrim` `rgba(50,50,50,0.32)`. That is the only
  scrim in the system and the only place this value appears; it is
  `surface-dark` at low opacity, not a new color.
- One `button-primary` and at most one `button-secondary`, bottom-right. The
  close control is a `button-icon` at the top-right.
- Focus moves into the dialog when it opens and returns to whatever opened
  it when it closes. Escape closes it, and so does the scrim.
- Motion: opacity only, one step, no travel. A dialog announces itself by
  existing; sliding it in adds nothing.

### Matriks Penugasan Aktor

Not present in the reference; derived from this system's tokens.

- Full-width `card` containing a table. No card padding on the left/right edges of the table — rows run to the card boundary so long matrices stay readable.
- Header row: `surface-inset` background, `label` type in `muted`, sticky on scroll.
- Rows: `44px` tall, separated by 1px `hairline`. No zebra striping — the ladder is too tight for it to read as anything but noise.
- First column (actor name) sticky, `title-sm`; remaining cells `body-md`.
- Assignment state is a `status-chip`, never a colored cell background.
- Empty cell: an en dash in `disabled`, not a blank.

### Desa Kembar

Not present in the reference; derived from this system's tokens.

- Two columns inside one `card`, `16px` gap, each headed by a compact `card-entity` without the delta.
- Metric rows are shared: label on the left in `label` `muted`, the two values right-aligned in `metric-md`, and the delta between them in `positive` or `critical`.
- **A categorical row carries `body-md`, not `metric-md`** (added 9 September 2026). A zone name is a word, not a figure, and two zone names at 24px overflow the panel at its narrow widths. The metric sizes exist to make numbers scan; giving them to prose buys nothing and costs the row.
- Rows separated by 1px `hairline`.
- The stronger of the two values carries `ink`; the weaker carries `body`. Do not color the values themselves by status — only the delta.
- **The delta is a direction mark, not a figure** (clarified 9 September 2026 with the Desa Kembar lens, PRD app §5.3). It is a small caret in `positive` or `critical` sitting between the two values, and it carries no number: this dashboard never computes a domain figure client-side, and a difference between two scores is a domain figure. A row whose sides are not comparable — a categorical value, or one side empty — carries no mark at all. The caret is `aria-hidden` and paired with visually hidden words, because a glyph alone is not a reading.
- Below the rows: a `ramp-meter` per village, stacked, sharing one axis so the two markers can be compared directly.

### Asisten Desa

Not present in the reference; derived from this system's tokens (PRD app
§5.4).

- **Empty state.** Before any question is asked, one `body-md` line invites
  a question and says plainly that the conversation is lost on reload,
  followed by a `card-inset` list of three example questions. Each is a
  button row in the same shape as a Desa Kembar row — `body-md` text, a
  trailing chevron — and sending one starts the conversation with it.
- **Turn shapes.** A question is a `card-inset` block, right-aligned, max
  85% of the panel width. An answer is not a bubble at all: `body-md` in
  `ink`, full panel width. The asymmetry is the speaker marker — two
  mirrored bubbles would spend the ladder on decoration and halve the width
  available to the answer, which is the longer of the two.
- **Trace block (`Sumber jawaban`).** A `card-inset` with a chevron in its
  header, open by default, sitting directly under the answer it belongs to.
  Each row: a 6px dot (`positive` for a call that returned, `critical` for
  one that failed — the `status-chip` rule, color on the dot, words in
  `ink`), the tool name in `title-sm`, its arguments in `micro` `muted`
  beneath. A row whose call maps to a lens is a button: a 1px `border-strong`
  rule on hover (not a `surface-inset` lift — the row already sits on
  `surface-inset`, and there is no brighter level left inside the block to
  lift it onto), a trailing chevron, and the focus ring. Rows that map to
  nothing stay inert and carry no chevron — a chevron that leads nowhere is
  a lie about what the row does.
- **Answer states.** Pending: one `micro` `muted` line, no spinner over the
  map. Failure: a `card-inset` with a `critical` dot, the message in `ink`,
  the machine code in `micro` `muted`, and a `button-secondary` to send
  again. Nothing retries on its own.
- **Why bold markers disappear.** Model answers can arrive with markdown
  `**bold**` markers; the client strips them instead of rendering bold text.
  This is not a missed feature — this system already caps weight at 500
  (Do's and Don'ts, "Don't use bold weight"), so an answer has no heavier
  weight to render into in the first place.
- **Reset control.** "Percakapan baru" in the panel header is `label` text in
  `muted` with a 16px icon, no fill — not `button-primary`. This panel
  spends its one orange action on Kirim (Orange is a budget); starting the
  screen over is not the action the screen is for.

### Berita Desa

Not present in the reference; derived from this system's tokens (PRD app
§5.5).

- **Where it sits.** A plain `card` in the left panel, the ninth section of
  Kartu Ekonomi Desa — after Desa Kembar, before Mutu data. It is the only
  section whose words were written outside this system.
- **The provenance line.** The `title-md` heading is followed by one `micro`
  `muted` line saying the news is gathered automatically and the summaries are
  machine-written. That line is not optional: everything under it is
  third-party text, and knowing where it came from is what lets a reader judge
  it at all.
- **A row is four layers.** The headline is a link in `title-sm` colored
  `link` with a 16px external-link icon trailing it; a `micro` `muted` line
  reading `source • date`; the summary in `body-md` `body`, clamped to three
  lines; then the category chips. Rows are separated by 1px `hairline`, with no
  shadow and no surface lift — the whole section sits on `surface`.
- **Category chips are static badges**, not `chip-filter`: `rounded.xs`,
  `surface-inset`, `badge` type in `ink`. They cannot be clicked, carry no
  active state, and filter nothing. Giving them the filter chip's shape would
  promise an interaction that does not exist.
- **A headline whose URL is not `http` or `https` renders as plain text** — no
  `link` color, no icon. A link that cannot be opened must not look like one.
- **Volume.** Five rows show; the rest sit behind one button at the foot of the
  section (`surface-float`, no shadow, `rounded.full`, 40px). Opening it calls
  nothing — the page is already in the client's cache.
- **States.** Loading: two `animate-pulse` blocks at row height, no text.
  Empty: one `body-md` `muted` sentence inside a section that keeps its
  heading, because an empty list is an answer and hiding the section would tell
  the reader the feature does not exist for their role. Failure: the Notice
  Block shape inline — a `critical` dot, `title-sm` heading, `body-md` message,
  the machine code in `micro` `muted`, and a retry button — inside the same
  card.

### Laporan Desa

Not present in the reference; derived from this system's tokens (PRD app
§5.5).

- The last `card` in the panel, after Mutu data, and only for the roles that
  may download it. Heading in `title-md`, one `body-md` `body` sentence naming
  what the file holds and that it is assembled on each download, then one
  button.
- The button takes `button-secondary` geometry — `surface-float`, `ink`,
  `rounded.full`, 40px tall, `18px` horizontal padding — **without the float
  shadow**, since nothing inside the data panel casts one. A 16px download icon
  leads the label.
- It is deliberately not `button-primary`. This screen's one orange is spent
  elsewhere, and exporting a card is not what the Kartu lens is for.
- **States.** Working: the button disables itself, its label becomes a verb
  phrase, and `aria-busy` is set. No spinner — the same rule the Asisten Desa
  pending line follows. Failure: the Notice Block shape inline beneath the
  button, machine code included; the button returns to its resting label and is
  itself the retry. A second control repeating the same action would be one too
  many.

### Halaman Admin

Not present in the reference; derived from this system's tokens (PRD app
§5.7). Added 10 September 2026.

- **The frame.** Rail plus one column of cards on `canvas`, `8px` gutters, the
  same rhythm as the left panel. There is no map here, so this page loses the
  one saturated region the system has; hierarchy falls to the gray ladder and
  the size of the numbers. That costs one extra rule: **no `panel-insight` on
  this page.** A dark block with no map beside it becomes the heaviest thing on
  screen and pulls the eye to the wrong place.
- **One orange per tab, and two tabs have none.** The Berita tab spends it on
  "Segarkan berita". The Pengguna tab has no primary action, because the role
  control submits itself, and the Status tab only reads; its "Muat ulang
  status" is a `button-secondary`.
- **User rows, not a table.** Account in `title-sm`, the created and changed
  dates in `micro` `muted` beneath it, the `form-select` at the right. Rows are
  separated by 1px `hairline` with no zebra striping. Rows rather than the
  Matriks Penugasan Aktor pattern, because these rows carry a control and have
  to fold into two tiers below `768px` instead of scrolling sideways.
- **Selected-village chips.** `rounded.full`, `surface-inset`, `label` type in
  `ink`, a 16px `muted` × button trailing. These are removable tokens, not
  filters: no active state, no `aria-pressed`, and the × carries the village
  name in its `aria-label` — three chips reading "Hapus" cannot be told apart.
  The `n dari 50` counter sits in `micro` `muted` above the group.
- **Job progress is written, not drawn.** "Selesai 12 dari 30 desa" in
  `body-md`, led by a `status-chip` for the state (`caution` while running,
  `positive` when finished, `muted` when no job has run). This system has no
  `progress-bar` spec, and one background job is not reason enough to invent
  one.
- **System counts use `metric-lg`,** with a `label` above and one `micro`
  `muted` line saying the counts are estimates for large tables. Numbers are
  the only thing on this page allowed to be big.
- **Deletion is confirmed inside its own row.** The "Hapus" button
  (`button-secondary` geometry without the float shadow) is replaced by a
  "Batal" / "Ya, hapus" pair on the same row. No modal and no scrim. The row
  being deleted carries `aria-busy` and its buttons lock — the same shape as
  the Laporan Desa download button.
- **States.** Loading: two `animate-pulse` blocks at row height. Empty: one
  `body-md` `muted` sentence inside a card that keeps its heading, and the
  sentence differs depending on whether a filter is active — "no accounts
  match that search" and "no accounts yet" are different answers. Failure: the
  Notice Block shape inline (a `critical` dot, `title-sm` heading, `body-md`
  message, the machine code in `micro` `muted`, a retry button).
- **One error bypasses the shared mapping.** A rejected role change shows the
  server's own sentence verbatim. The 403 mapping in this product reads
  "this account has no access to this feature", which is the wrong sentence for
  an admin who just tried to demote themselves; the server already says the
  right one. This is the only place in the dashboard that skips the mapping.

### Charts

- **Column chart** — bars in `chart-fill-positive`, each carrying a `status-cap` on top. Tooltip is a `tooltip` pill with a downward tail.
  - **Caps are 6px and differ in shape, not only in color.** `positive` is a solid bar, `caution` is a solid bar with a 2px notch cut from its centre, `critical` is two 2px bars with a 2px gap. A reader who cannot separate the hues must still be able to separate the states.
  - **Axis labels align to the data points they name.** A label sits at the horizontal centre of its own column. Spreading N labels evenly across M columns puts "12.00" over the wrong bar and makes the chart lie — do not do it. Label every nth column, positioned by index.
  - **A tooltip anchors to its own datum.** Position it from the index it describes, never at a fixed percentage of the chart width.
  - **A highlight must be visible against what it highlights.** Do not tint a column with a color it already uses; lift the column with `surface-inset` behind it or a 1px `border-strong` rule instead.
- **Area chart** — fill `chart-fill-warm` at ~60% opacity, 2px `primary` stroke, `chart-grid` gridlines, `micro` axis labels in `muted`.
- **Progress bar** — 6px, `border` track, `positive` fill, pill ends. Verdict label sits above-right in `title-sm`.

### Map Overlays

- Selected area: 2px `map-outline-selected` stroke, `map-fill-selected` fill, a dotted texture at low opacity, and a centered label in white with a `micro` subtitle.
- **Un-selected desa boundaries** (kabupaten view, before a village is picked): 1px `map-outline-idle` stroke, `map-fill-idle` fill — the quiet default a village lifts out of once `Selected area` above takes over.
- Other areas of interest: 2px `map-outline-alt` stroke, `map-fill-alt` fill, label in white.
- Labels sit centered on the polygon with a wireless/monitor icon above them.
- Minimap bottom-left, `rounded.md`, with a white viewport rectangle. Scale bar beneath in `micro` white.
- **Markers and cluster circles** — a white (`surface-float`) circle pin
  carrying its glyph or count in `map-marker` navy (6.6:1 on white). The
  tiered cluster circles (province → kabupaten → desa) use this same pair;
  navy never colors chrome text, only map markers and their glyphs.
- **Model-result areas** (validated cells, route areas): 2px
  `map-gold-outline` stroke + `map-gold-fill`. Gold lives only on top of
  satellite imagery and never carries text. It is not `caution`: gold on
  the map is content, amber in the chrome is status — do not swap them.

### Zone choropleth (Peta Peran)

Added 9 September 2026 with the Peta Peran lens (PRD app §5.3). Each of the
four handling zones fills its polygon at 45% opacity in the zone's hue, with
a 2px stroke in the same hue at full opacity. The hue is bivariate, not
ordinal — it marks *which axis reads high*, not a rank: magenta
`map-zona-pemerintah` is Potensi high, cyan `map-zona-poros` is Kesiapan
high, violet `map-zona-mitra` sits at the hue midpoint between them because
both axes read high, and slate `map-zona-bantuan` marks neither axis high.
Belum Terpetakan carries **no fill** and a 1.5px dashed white stroke
(`map-zona-belum`, `dasharray [3, 3]`) instead — "measured but unzoned" is a
different state from "low readiness on every axis," and a solid fill would
read as the latter. A desa with no model row at all (the pseudo-feature
"KAWASAN") is not Belum Terpetakan either; it keeps the existing
`map-fill-idle`/`map-outline-idle` pair, the quiet default every unselected
boundary already uses.

Hue is not the only carrier of zone identity. Magenta and violet sit close
together for a reader with red-green color deficiency, so the legend, every
list row, and the village detail card always spell the zone name out in
words — the dot is a reinforcement, never the sole signal.

The Belum Terpetakan swatch (chip dot, legend) additionally carries a 1px
`border-strong` ring around its fill — added 9 September 2026, resolving a
review finding. `map-zona-belum`'s translucent white reads correctly as a
dashed line over satellite imagery, but disappears against the light panel
chip surfaces (`surface-inset`) it swatches on. The ring is swatch-only; the
map layer itself stays dash-only, unchanged.

### Score choropleth (Citra Potensi Desa)

Added 9 September 2026 with the Citra Potensi Desa lens (PRD app §5.3,
ADR-0019). Where the zone choropleth above encodes five discrete categories,
this one encodes a continuum: each desa polygon is filled at 45% opacity with
the five-stop data ramp (`ramp-1` → `ramp-5`) interpolated over the model's
0–100 score. It adds **no outline of its own** — the 1px `map-outline-idle`
boundary every unselected desa already carries is enough separation, and a
colored stroke on a continuous scale is noise rather than information.

A desa with no score row keeps the quiet default (`map-fill-idle`,
`map-outline-idle`) at full opacity, exactly like the pseudo-feature "KAWASAN"
under the zone choropleth. Its fill already carries its own low alpha; dimming
it a second time to 45% would push it to roughly 0.027 and erase it.

**The scale is relative within one kabupaten, and color cannot say that.** The
model normalises and ranks inside each kabupaten, so the same green in two
kabupaten does not mean the same thing. The panel states the limit in words
beside the legend, and the ranked list refuses to render without an active
kabupaten. Never place two kabupaten side by side under this ramp.

**Legend variant of `ramp-meter`.** The panel key for this scale is a
`ramp-meter` **without its marker** — the tick row alone, flanked by two
`micro` labels naming the low and high ends. A marker means "this village
scores here"; a legend has no subject, so it carries none. This is the only
sanctioned use of `ramp-meter` without a value.

### Route lines (Jalur Ekonomi)

Added 9 September 2026 with the Jalur Ekonomi lens (PRD app §5.4). A 2px
gold line (`map-route.lineColor` = `map-gold-outline`, 0.85 opacity) runs
from each Desa Sejalur to its Desa Poros. The poros itself is a
`surface-float` circle with a gold stroke (radius 7px); each member desa is
a small solid gold circle (radius 4px). Gold is already this system's
"model-result areas" color (see above) — a route is one more kind of model
result, so the lens introduces no new hue.

## Do's and Don'ts

**Do**
- Keep the map the most colorful region of the screen.
- Use the gray ladder for hierarchy — a step up in surface lightness reads as "closer to the user".
- Put a `label` above every number. A bare figure with no label is never acceptable.
- Group four related metrics into one `card-quadrant`.
- Let cards touch — `8px` gutters, not `16px`.

**Don't**
- Don't introduce pure white surfaces. It breaks the ladder and flattens the map.
- Don't use more than one `button-primary` or one `panel-insight` per screen.
- Don't use status colors as backgrounds, button fills, or nav accents.
- Don't add borders to panel cards. The gutter is the separator.
- Don't add shadows to anything inside the data panel.
- Don't use bold weight. 500 is the ceiling.
- Don't add decorative gradients. The only gradient in the system is the data ramp.

## Responsive Behavior

- **≥1280px** — full four-column layout as specified.
- **1024–1279px** — panel narrows to `400px`; `card-quadrant` stays 2×2.
- **768–1023px** — panel becomes an overlay drawer above the map, `float` shadow, full height, dismissible. Rail collapses to icons-only with no labels (it already has none) and stays fixed. The Asisten Desa panel, when open, becomes a full-height layer over the map (PRD app §5.1).
- **<768px** — single column. Map takes the top 45vh, the panel stacks beneath it as a scrolling sheet with a drag handle. `card-quadrant` degrades to 1×4 stacked cells with hairlines between. `card-float` becomes a bottom sheet. The Asisten Desa panel, when open, becomes a full sheet (PRD app §5.1).
- Matriks Penugasan Aktor scrolls horizontally inside its card at every breakpoint below 1280px; the first column stays sticky.

**Controls hold their shape at every width.** The map toolbar is the system's most fragile row, so it carries hard rules:

- Button labels never wrap. Set them `nowrap`; a two-line button changes the toolbar's height and shifts everything beside it.
- The search field truncates its placeholder with an ellipsis. Text inside a fixed-height pill must never exceed that height — it will spill outside the rounded shape.
- Below `1280px` the toolbar drops label text and keeps icons, rather than letting labels compete for a width that is not there.
- `card-float` is capped at `380px` and must never overlap the map-control stack or the minimap. Reserve the right `80px` and the bottom `160px` of the map for controls; the floating card lives outside that reserve.

**The drawer needs a way out** (added 10 September 2026). Between `768px`
and `1023px` the left panel floats over the map, so it takes the `scrim`
`rgba(50,50,50,0.32)` behind it — the same and only scrim value in the
system, shared with `dialog`. Clicking the scrim folds the panel, and so does
Escape. It is **not** a modal: focus is not trapped, `aria-modal` is not set,
and the rail stays reachable, because the rail is what you fold the panel to
get to. The panel header holds its place while the content scrolls (`sticky`)
— a fold control that scrolls out of reach on a long panel is the same defect
as not having one.

**An overlay must not leave live controls under itself.** In the same range
the Asisten Desa panel covers the right edge of the map, which is where the
map keeps its control stack and its own trigger. Those controls are removed
with `display: none` while the panel covers them, not merely hidden from
view: a button that keeps its tab stop while sitting behind an opaque panel
sends keyboard focus somewhere invisible. The map toolbar row takes the
higher stacking level and shifts clear of the drawer's width, so the search
field is never the thing being covered.

**Below `768px`, the rail lies down.** It becomes a horizontal strip at the
foot of the screen and the shell stacks in one column, returning its `64px`
plus gutter — 19% of a 375px viewport — to the content. The foot, not the
head: the head is already spent on the map's search field, and the foot is
where a thumb reaches. Icons, order, and `aria-current` are unchanged; only
the axis moves.

**The sheet says it scrolls.** The panel below `768px` carries a 24×4
`rounded.full` handle in `line-strong` at 60% on its top edge, `aria-hidden`.
It is a mark of affordance, not a control: it takes no focus and no drag
gesture. The resize separator is the opposite — it exists only from `1280px`,
where dragging a width is meaningful.

**The map keeps a floor.** `45vh` is a share, not a size, and in phone
landscape it resolves to ~144–169px, which is less than the 172px the
bottom-right control stack needs — the top button clips out of an
`overflow-hidden` container and what is left of it falls under the 24px
minimum target. The map takes a `min-height` of `260px` below `md`; the sheet
beneath absorbs the difference.

Every breakpoint in this section is a requirement, not an aspiration. A screen that only works at one width is unfinished.

## Iteration Guide

When adding a component, answer these in order:

1. Does it live in the panel or over the map? That picks `surface` vs `surface-float`.
2. Does it carry a number? Then it needs a `label` above and one of the `metric-*` sizes.
3. Does it carry state? Then it uses a `status-chip`, not a colored surface.
4. Does it need emphasis? Try a surface step or a size step before reaching for color.

If a new pattern needs a color that is not in the token list, do not invent one inline — propose the addition here first.

## Known Gaps

- **Hover states** are not derivable from a static reference; hover stays per component (single-step surface lift). **Focus — resolved 8 September 2026:** 2px `focus` `#0d8a7e` ring at 2px offset, defined under Interaction accents.
- **Dark mode** is not defined. The gray ladder inverts poorly; a dark variant needs its own ladder rather than a mechanical flip.
- **Form controls — resolved 9–10 September 2026.** Text input, label, error, and hint are specified under Form Controls above, alongside the `dialog` spec they arrived with. The single-select chip group joined the same day, specified under `chip-filter` above. The select closed 10 September 2026 with the role control on Halaman Admin, specified as `form-select` above. Still unspecified because nothing needs them yet: checkbox, radio, and date picker.
- **Empty, loading, and error states — resolved 10 September 2026.** What
  five surfaces had specified one at a time — Asisten Desa, the Notice
  Block, Berita Desa, Laporan Desa, and Halaman Admin — is now a system rule
  under Empty, Loading & Error States, covering every panel and lens, plus
  the paused state that used to render nothing at all and the status region
  that used to leave every success silent.
- **Accessibility — corrected 10 September 2026, and the correction is the
  point.** This bullet previously read "resolved… The system carries no
  accepted contrast debt", on the strength of a `muted` figure measured
  against a ground this system forbids. Two pairs failed AA in shipped code:
  `muted` on every surface in the ladder (see Text, now `#6b6b6b` plus a
  placement rule), and white on `positive-deep` at badge size (see Status
  colors, now a `status-chip`). `button-primary` carrying `ink` on `primary`
  (4.70:1) was and remains correct.

  What the system now accepts deliberately, written down rather than
  discovered later: `muted` measures 3.89:1 on `canvas`, so it is barred from
  sitting there rather than darkened further — darkening it again would
  narrow the gap between `muted` and `body` until the two tiers stop reading
  as tiers. `caution` and `positive` remain unusable as body-size text, as
  the next bullet already states. Zone hue remains a reinforcement and never
  the sole carrier of zone identity, as Zone choropleth already states.

  The lesson worth keeping: a contrast figure is meaningless without the
  ground it was measured on. Every ratio in this file now names its
  background.
- **Status colors as text.** `caution` `#e8b348` measures 1.8:1 on `surface` and `positive` `#31a863` measures 2.8:1. Both are safe as fills, marks, and caps; neither may be used for body-size text. If a status ever needs to be spelled out in words, the words go in `ink` and the color rides alongside them on a chip.
