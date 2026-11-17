# Fieldwork Festival

Plain HTML, CSS and vanilla JS. Content lives in `index.html` (no JSON). See `README.md` for run and deploy.

## Motion tiers

Every effect on the page belongs to one of three tiers. A new or changed effect must fit a tier, and this list must be updated in the same change.

**Tier 1: plays once, under 5 seconds.** Removed entirely under `prefers-reduced-motion: reduce` (global reset at the top of `styles.css`).
- Collage paste-in: hero shapes land like cut paper on load. 560ms each, staggered to about 1.1s total (`.paste`, `.p1`-`.p5`). Classes are stripped after 1.4s so it never replays (`app.js`).
- Wordmark misregistration: lilac pass slides into place behind the butter pass on load. 900ms after a 420/560ms delay, done by about 1.5s (`.wm-reg`, `@keyframes misreg`). Under reduced motion it sits at its final offset.
- New shape pop-in: a shape added from the poster maker tray scales in. 420ms (`.pop.is-new`).
- Micro-transitions on interaction, all 120-200ms: button and tab color changes, pass-matrix column pick, row `+` marker, tray button lift on hover, toolbar buttons, speaker photo duotone-to-color on hover, mobile pass bar slide-in, dragged shape scale-up.
- Smooth scrolling for in-page links (`html { scroll-behavior: smooth }`). Under reduced motion it jumps instead.

**Tier 2: has a reduced version.**
- Cross-link glow: clicking a session link on a speaker card, or a speaker name in the schedule, pulses only that one target. 1.25s x 4 = 5s, then it settles into a static outline marker until something else is picked (`app.js` `pick()`; `@keyframes tile-glow`, `face-glow`). Full version pulses a glow and swells the target (scale 1.02 tile, 1.05 portrait). Reduced version (`tile-glow-still`, `face-glow-still`) keeps the color pulse and drops the swell. It needs `!important` to beat the global reduced-motion reset.

**Tier 3: sustained, with a toggle.**
- None. Nothing on the page loops or runs continuously, so there is no motion toggle.
