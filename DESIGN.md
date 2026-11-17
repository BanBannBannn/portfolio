---
name: Trần Văn Gia Bân — Portfolio
description: A quiet, content-first résumé page. One column, one typeface, one link accent.
colors:
  bg: "#fbfbfa"
  card: "#ffffff"
  line: "#e3e3e0"
  muted: "#64646b"
  body: "#34343a"
  ink: "#111113"
  accent: "#1f5fd1"
  ok: "#1a7f4b"
  bg-dark: "#111113"
  card-dark: "#18181b"
  line-dark: "#2a2a2f"
  muted-dark: "#9b9ba3"
  body-dark: "#cfcfd4"
  ink-dark: "#f4f4f5"
  accent-dark: "#7fa8ff"
  ok-dark: "#4ccb87"
typography:
  name:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4.4vw, 2.5rem)"
    fontWeight: 700
  intro:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1.8vw, 1.1875rem)"
    fontWeight: 400
  title:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  small:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.9375rem"
  meta:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.875rem"
  micro:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.8125rem"
rounded:
  focus: "4px"
  button: "8px"
  card: "12px"
  round: "50%"
spacing:
  maxw: "880px"
  gutter: "clamp(20px, 5vw, 40px)"
  label-col: "160px"
---

# Design System: Trần Văn Gia Bân — Portfolio

## Direction

A résumé that happens to be a web page. The owner rejected two earlier worlds:
the warm-paper/serif/vermillion "Swiss editorial" one (too flat) and the
"Alphabet Storm" one (canvas letter storm, monumental Anton, ink-fragment
buttons — rejected as over-designed). This version removes every decorative
device. Hierarchy comes from weight, size and spacing only.

The target readers are recruiters at large tech companies scanning on a phone
and engineers reading on desktop. The first screen must show: name, role,
location, a two-sentence summary, availability, and Email / CV / GitHub /
LinkedIn.

## Rules

- One typeface (Be Vietnam Pro, 400–700). No display face.
- Accent blue is for link hover and focus only. Green is for the availability
  dot and the "Live" project flag only. No other hue.
- No canvas, no scroll-driven animation, no entrance animation, no hover lift.
  Transitions are colour/opacity only, 0.15s.
- No shadows except the 4px halo on the availability dot.
- Section headings are plain words ("Experience", "Projects") in a left label
  column from 760px up; stacked above content on mobile.
- No project images or image placeholders until real screenshots exist.
- No invented metrics, testimonials or slogans (see PRODUCT.md).

## Layout

Single 880px column. Order: header (portrait, name, role, intro, status,
actions) → Experience → Projects → Skills → About → Contact → footer.
Sections are separated by a 1px `--line` rule.
