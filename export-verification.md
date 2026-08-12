# Export verification

A fresh live export was completed after the typography, shared panel-anchor, and text-only glass changes. The flow was upload photo → enter “Book more qualified calls for my coaching offer” → generate AI copy → export.

The new `pasted-file-xbbaet-image.png` download is 1080×1920 and opens successfully. The generated headline and caption remain inside the lower story panel, with readable scale and no clipping. The downloaded card uses the selected content and the same bottom-panel placement as the live preview. The source image itself contains large pre-existing text (“THE FULL STORY / DM me…”), which remains part of the uploaded photo; Storyloom does not add a watermark layer. The production render plan returns `drawWatermark: false`, and text-only glass modes now skip the panel background, backdrop blur, border, and shadow.

## Screenshot-specific final observation

The final opened file was `file:///home/ubuntu/Downloads/pasted-file-xbbaet-image.png`, shown in the browser as a 1080×1920 PNG. In the opened-image screenshot, the subject remains visible behind the overlay, the generated headline “Clarity starts with a single conversation.” is contained inside the lower rounded panel, and the caption remains readable without clipping. The panel is positioned in the bottom safe area with visible breathing room from the frame edges. No Storyloom watermark is drawn by the export renderer; the faint source-image lettering visible behind the card is part of the uploaded photo itself. The screenshot path used for this inspection was `/home/ubuntu/screenshots/page_2026-08-12_20-24-18_1607.webp`.
