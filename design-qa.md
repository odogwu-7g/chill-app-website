# How it works — static template pass

Source visual truth: assets/chill-how-it-works-template.png (1672 × 941).
Implementation evidence: review/how-desktop.jpg and review/how-mobile.jpg.
State: /#how-it-works, static section, no process animation script loaded.

## Comparison

Desktop browser viewport: 1363 × 936 CSS px, devicePixelRatio 1. Content width
1348 px after the scrollbar. The reference is proportionally displayed at
1348 × 758.64 CSS px. Browser screenshot and source image were emitted in the
same comparison input; the section was subsequently saved as a focused crop.
The persistent site header and existing credit note sit outside the artwork.

Mobile: a 390 × 844 CSS px iframe renders the actual site, not separate markup.
The browser showed the header, first card, approval card and payment card.
The template's three columns intentionally stack. Artwork uses measured source
windows (x=86/595/1095, y=238); semantic copy below each image is 16px or larger.

## Required fidelity surfaces

- Typography: desktop source pixels retained, including headline wrapping and
  gold/coral accents. Mobile uses the existing site font with live HTML copy.
- Spacing: desktop aspect ratio preserved; mobile uses a readable single column
  with 24px gutters and 22px card gaps.
- Colours: source image preserves marble, black, cyan, glass and connecting line.
  Mobile copy panels use matching solid colours as a responsive adaptation.
- Image quality: original uploaded PNG retained without regeneration or lossy
  conversion. The desktop pass is deliberately a flattened static composition,
  not independently editable or animatable graphic layers. This was disclosed.
- Copy: exact headings and descriptions retained in semantic HTML, available to
  screen readers on desktop and visibly rendered on mobile. Existing approval
  qualifier remains below the reference region.

## Checks and findings

Desktop navigation to How it works confirmed the intended fragment and section.
The visible section contains no controls requiring new behaviour. No application
console errors were observed; one browser-extension metadata error was unrelated
to the site. Asset loaded at its original 1672px width. No horizontal clipping
was visible in the mobile card content. JavaScript syntax and static build passed.

No actionable P0/P1/P2 findings for this explicitly static artwork pass.
The desktop comparison passed on first review. Mobile stacking is an intentional
adaptation because the user supplied only a desktop composition. Future animation
work must separate visual layers; no animation readiness is claimed here.

final result: passed


## Scroll animation update — 2026-09-10

Added scroll-triggered heading typing, sequential card bounces, ID and QR scanning highlights, and approval glow. Original artwork is restored after desktop animation; reduced-motion uses static artwork. Added a clean marble animation background to prevent stretched texture patches. Build, JavaScript syntax, and whitespace checks pass. Current browser QA is blocked by preview routing: the supervised preview reports running, but the cloud browser serves an unrelated project after restart. Previous static screenshots are not evidence of this animation update.
