# Project TODO

- [x] Refine the visual design system for an elegant, editorial story-creation workspace
- [x] Add multi-photo upload with preview thumbnails and image removal
- [x] Add AI copy generation for each uploaded image
- [x] Add story sequence editor with card ordering, editable headline/caption text, placement, and style controls
- [x] Add full-bleed visual story card renderer with gradients and branding
- [x] Add save, name, and revisit past story sequences in the personal dashboard
- [x] Add export/download for individual cards and the full sequence as image files
- [x] Add or update Vitest coverage for the core story sequence behavior
- [x] Verify responsive layout, visual quality, and core interactions in the browser

## Change history

- [x] User clarified scope: no features beyond upload, AI copy, editing/reordering, saving/revisiting, and export

## Follow-up fixes from verification

- [x] Auto-run AI copy generation for every newly uploaded image, with loading and retry states
- [x] Implement authenticated, user-scoped sequence persistence and a dedicated personal dashboard route
- [x] Add visible per-card export controls alongside full-sequence export
- [x] Add meaningful Vitest coverage for sequence saving, ordering, editor updates, and export helpers

## Final verification fixes

- [x] Add per-card AI generation status and retry controls for newly uploaded images
- [x] Implement reopening a selected saved sequence from the dashboard into the editor
- [x] Add Vitest coverage for authenticated save/list behavior and export helper logic

## Final correctness fixes

- [x] Make per-card AI retry target the intended card deterministically
- [x] Restore the saved sequence name when reopening from the dashboard
- [x] Add Vitest tests for authenticated story save/list procedures

## User-requested update

- [x] Remove all seeded demo story cards and demo image data from the initial editor state
- [x] Make the empty state upload-only with an explicit Create stories action
- [x] Require a product or story goal brief before AI story copy generation
- [x] Pass the goal brief into AI generation so copy supports outcomes such as booking calls or getting sales
- [x] Update tests and verify the goal-first creation flow

## Final verification follow-up

- [x] Disable or guard Save and Export until at least one photo exists
- [x] Verify the upload, goal brief, and Create stories interaction end to end
- [x] Add regression coverage for empty-state save/export restrictions

## Goal-flow verification

- [x] Add component-level or equivalent flow coverage for upload photos, entering a goal, creating stories, and receiving generated card copy

## Production-path verification

- [x] Refactor the live Create stories handler to use the tested creation-flow helper
- [x] Re-run checks and verify the production path before checkpointing

## Visual editor upgrade

- [x] Add per-card text treatment controls for plain, glass, and blurred-glass panels
- [x] Add per-card solid text color control with a curated palette and custom color input
- [x] Add per-card gradient overlay controls with editable gradient colors, direction, and strength
- [x] Add richer Figma-like card styling controls for text scale, radius, alignment, and overlay intensity
- [x] Improve the rendered card preview and export renderer so styling controls affect share-ready output
- [x] Add tests for visual-style serialization and export styling behavior
- [x] Verify the upgraded editor visually on desktop and mobile

## Visual editor verification fixes

- [x] Add curated preset text-color swatches alongside the custom color picker
- [x] Add user-facing gradient direction controls and connect them to gradientAngle
- [x] Add meaningful tests for production export styling behavior

## Export behavior verification

- [x] Extract the production export-style configuration into a shared helper
- [x] Test export configuration for treatment, gradient direction, color, alignment, radius, and opacity
- [x] Re-run checks after the export behavior test is wired

## Export test coverage fix

- [x] Add Vitest coverage for exportStyleConfig across treatment, gradient angle, text color, alignment, radius, and opacity
- [x] Re-run checks after the exportStyleConfig test is added

## Spacing and true glass upgrade

- [x] Add card text-panel padding controls for horizontal and vertical spacing
- [x] Add glass opacity, blur strength, border opacity, and shadow strength controls
- [x] Add text line-height and letter-spacing controls
- [x] Add text-panel width and offset controls for more design freedom
- [x] Make the glass treatment use a visible frosted backdrop effect in the live card preview
- [x] Apply the new spacing and glass settings to share-ready exports
- [x] Add tests for spacing and glass export configuration
- [x] Verify the refined card editor visually on desktop and mobile

## Final glass fidelity fixes

- [x] Add a user-facing vertical panel offset control
- [x] Apply letter spacing in canvas export rendering
- [x] Add a supported blur-strength approximation to canvas export rendering
- [x] Re-run checks after the final glass fidelity fixes

## Client-ready story workflow upgrade

- [x] Make card text fit safely inside the story frame with smaller defaults and overflow-aware layout
- [x] Add explicit text size control that affects preview and export
- [x] Remove the Storyloom watermark from exported images
- [x] Add Copy style and Paste style actions for reusing a card design across photos
- [x] Add safer image framing controls so text does not cover the main subject
- [x] Research current story-sequence and designer workflow needs and select only focused client-useful features
- [x] Add selected client-ready design features from the research
- [x] Add tests for fit-to-frame, watermark-free export, and style-copy behavior
- [x] Verify export files and card composition on desktop and mobile

## Final client export verification

- [x] Add content-length-aware text fitting for long headlines and captions in preview and export
- [x] Add image focal-point and zoom controls for subject-safe framing
- [x] Add a direct test proving export configuration contains no watermark layer
- [x] Perform an actual exported-card verification pass, not only editor screenshots

## Final export fidelity follow-up

- [x] Fit caption text independently and size the export panel from wrapped headline and caption content
- [x] Apply image focal point and zoom to the canvas export crop
- [x] Make the renderer-level watermark omission explicit and testable
- [x] Verify a generated export output through the live app flow

## Final evidence pass

- [x] Add a renderer-level export drawing contract that proves watermark drawing is disabled in production configuration
- [x] Inspect the actual downloaded PNG to confirm framing, text fit, and watermark-free output
