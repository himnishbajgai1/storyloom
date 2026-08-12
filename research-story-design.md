# Story sequence design research

## Findings

Meta’s guidance says important text and logos should stay in the safe zone, avoid obstructing the visual, use a large enough contrasting font, and keep one clear call to action for a story ad. The safe-zone concept is especially important for Storyloom because the user reported text going out of frame and blocking the photo.

Overvisual describes a 1080 × 1920 story canvas with a centered 1080 × 1610 safe area, leaving roughly 155 px top and bottom margins for interface elements. It also recommends keeping text away from edges and placing calls to action in the lower-middle of the safe area rather than at the very bottom.

Canva’s current social design workflow emphasizes templates, brand kits with colors/fonts/logos, format switching, collaboration, photo editing, captions, and reusable on-brand content. For Storyloom, the focused subset is brand-safe layout, reusable card styles, fit-to-safe-area layout, a clear CTA goal, and export-ready files. Scheduling, publishing, analytics, and broad asset libraries are intentionally out of scope for this iteration.

## Selected implementation priorities

1. Fit-to-frame and safe-zone-aware text layout.
2. Explicit text sizing with smaller defaults and max-width constraints.
3. Watermark-free exports.
4. Copy style / paste style across cards.
5. Safe image framing and subject protection through panel placement controls.
6. Lightweight client workflow improvements that help reuse and consistency without adding unrelated product surface area.

## Sources

- Meta Business Help, “About text overlays and the safe zone for ads on Facebook and Instagram”: https://www.facebook.com/business/help/980593475366490
- Overvisual, “Instagram Story Safe Zone Checker”: https://www.overvisual.com/tools/instagram-story-safe-zone
- Canva, “Create scroll-stopping Social Media content, powered by AI”: https://www.canva.com/social-media/
