# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running
No build, lint, or test tooling. Open `ToDo/index.html` directly in a browser. `ToDo/specs.md` is the feature spec; update it when features change.

## Architecture
Static, dependency-free app in ToDo/: `index.html` (markup + all CSS inline) and `app.js` (all logic). No backend.

- State is a single `todos` array of `{id, text, done, priority, due}` (`id` = Date.now(), `due` = 'YYYY-MM-DD' or null), persisted to localStorage key `todos`. Theme is stored under `theme`. All localStorage access is wrapped in try/catch so the app works when storage is blocked.
- Rendering is a full re-render: every mutation calls `save()` then `render()`, which rebuilds the `<ul>` from scratch. No framework or diffing. New UI state (like `filter`, `editingId`) is a module-level variable that `render()` reads.
- `render()` works on a mapped copy of `todos`, filtered and sorted (priority rank, then due date). Handlers must mutate the original via `todos.find(x => x.id === ...)`, not the rendered copy.
- Inline edit: `editingId` makes `render()` swap the text span for an input; commit runs on Enter/blur, Esc cancels. `commit` guards on `editingId === t.id` to avoid double-firing when the input is removed on re-render.
- Delete keeps one `lastDeleted` `{todo, index}` for a 6-second Undo bar; only the most recent delete is undoable.
- Dark mode: CSS variables on `:root`, overridden by `:root[data-theme=dark]`. Add new colours as variables, not hard-coded values.

## Gotchas
- `render()` returns early on an empty list (it shows an empty-state message), so the "N tasks remaining" counter is not updated in that case.
- `validatePriority` is applied when adding and when rendering, so legacy tasks without a `priority` display as medium (the stored value is not rewritten). `MAX_TEXT_LENGTH` is enforced on add and edit only, not on load.
