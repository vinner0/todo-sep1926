# Plan for a To Do app

Specifications
1. simple to do app. No frills. basic.
2. It should run in a browser
3. Each task has a priority (High / Medium / Low); list is sorted High first
4. Dark mode toggle (icon button); choice is remembered (defaults to OS setting)
5. Edit a task by double-clicking its text (Enter/blur saves, Esc cancels)
6. Filter: All / Active / Done
7. "Clear completed" button
8. Optional due date; overdue open tasks are highlighted; ties within a priority sort by due date
9. Deleting shows an Undo bar for 6 seconds

Technology
- Plain HTML + CSS + JavaScript, no build step or dependencies
- Data stored in browser localStorage
- Files: index.html, app.js (open index.html in a browser)
