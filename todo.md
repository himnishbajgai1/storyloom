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

## Export, typography, and editing layout fixes

- [x] Make canvas export typography and positioning match the live card preview
- [x] Add additional font choices for headlines and captions
- [x] Add text-only glass and text-only glass-blur treatments that do not cover the entire background
- [x] Keep the active card preview visible while editing controls lower in the workspace
- [x] Improve editor spacing and mobile control usability
- [x] Add tests for export layout parity, font serialization, and text-only glass treatment
- [x] Verify a real download and the editing experience on desktop and mobile

## Final parity and text-glass verification

- [x] Align exported panel placement with the live preview’s top, center, and bottom geometry
- [x] Make text-only glass and blur skip the panel background, backdrop blur, border, and shadow in preview and export
- [x] Add tests for live/export layout parity and production text-only glass export behavior
- [x] Run a fresh real export after the final renderer fixes and inspect the downloaded image

## Renderer contract and evidence pass

- [x] Extract the production export render plan into a shared helper that includes anchor and panel-drawing behavior
- [x] Use the shared render plan inside the live canvas export path
- [x] Add direct tests for bottom/center/top export placement and text-only glass panel omission
- [x] Save explicit visual findings for the freshly opened PNG export

## Final render-plan closure

- [x] Drive canvas placement directly from exportCardRenderPlan.anchor
- [x] Cover top, center, and bottom exportCardRenderPlan cases
- [x] Add deterministic final export assertions for text fit, safe placement, and no watermark drawing
- [x] Record visual inspection details tied to the freshly opened PNG screenshot

## Final renderer evidence

- [x] Add a pure export-card render contract that asserts fitted headline/caption scales, safe panel bounds, and watermark-disabled output together
- [x] Save a screenshot-specific visual verification record for the latest downloaded PNG

## Screenshot evidence closure

- [x] Update export-verification.md with screenshot-specific findings for the final opened PNG

## Final example-inspired story sequencing upgrade

- [x] Add conversion-focused sequence presets based on the supplied examples: hook, problem, mechanism, proof, CTA
- [x] Add per-card CTA and supporting badge/ribbon blocks so stories can end with actions such as Watch now or See how it works
- [x] Add richer editorial composition controls for eyebrow, headline, body, CTA, and step/ribbon blocks
- [x] Improve the editor workspace so the active card preview and controls remain clear while editing
- [x] Add a stronger final story-sequence overview and card role labels
- [x] Ensure generated copy and exports use the chosen sequence structure consistently
- [x] Add tests for sequence roles, CTA blocks, and example-inspired export configuration
- [x] Verify the final story sequence output visually on desktop and mobile

## Role-aware AI generation closure

- [x] Pass the selected sequence preset and per-card role into the AI generation contract and prompt
- [x] Add shared deterministic role/preset assignment helpers for the editor and saved sequences
- [x] Add Vitest coverage for role assignment, preset mapping, and role-aware generation inputs
- [x] Re-run checks and visually verify the role-aware sequence flow before checkpointing

## Role-aware evidence follow-up

- [x] Add a mocked valid-role generation test proving role and preset reach the AI prompt
- [x] Capture fresh desktop and mobile verification after role-aware AI wiring

## Canvas controls and visual presets

- [x] Add direct drag-and-drop positioning for the active card’s text panel on the canvas
- [x] Add one-click Luxury, Bold, and Minimal visual presets with preview/export parity
- [x] Add independent visibility toggles for badge/eyebrow, CTA button, and card role controls
- [x] Add tests for drag position bounds, preset serialization, and element visibility behavior
- [x] Verify the updated editor and exports on desktop and mobile

## Final preset and visibility evidence

- [x] Add tests for persisted showBadge/showCta/showRole state and preset-applied style snapshots
- [x] Run a fresh preset and visibility-aware export verification pass

## Final live-path evidence follow-up

- [x] Test saved-card normalization and reopen persistence for showBadge/showCta/showRole flags
- [x] Record a fresh live export verification after applying a visual preset and hiding badge/CTA blocks

## Reopen and export artifact closure

- [x] Add a shared reopen visibility normalizer and test saved-card reload flags through it
- [x] Produce a live exported PNG after preset and visibility changes and record file-specific findings

## Export mismatch fix

- [x] Reproduce and document the mismatch between live preview and downloaded PNG
- [x] Align exported image crop, scale, and focal positioning with the live preview
- [x] Align exported text wrapping, scale, and panel geometry with the live preview
- [x] Add regression tests for the reported export framing and typography mismatch
- [x] Verify a fresh downloaded PNG against the live preview and record findings

## Preview/export parity evidence

- [x] Capture a fresh live preview screenshot for the same card and settings as the corrected PNG
- [x] Record a screenshot-specific side-by-side parity check for crop, panel position, text wrapping, and scale

## Element color controls

- [x] Add independent badge/eyebrow, CTA button, and card-role color fields to the card model with backward-compatible defaults
- [x] Add editor color controls and apply them in the live preview
- [x] Apply element colors to PNG export with preview/export parity
- [x] Preserve element colors through save/list and reopen flows
- [x] Add regression tests for serialization, persistence, and export color behavior
- [x] Verify the updated controls and exported output on desktop and mobile

## Element color parity follow-up

- [x] Apply roleColor to the same visible step-ribbon role block in the live preview as the PNG export
- [x] Run and inspect a fresh export after changing badge, CTA, and role colors, with findings tied to the artifact

## Complete colored artifact evidence

- [x] Generate one card with visible badge, CTA, and step ribbon using the three custom colors
- [x] Open that exact PNG and record file-specific findings for all three colored elements
