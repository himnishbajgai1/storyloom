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
