let todos = [];
try { todos = JSON.parse(localStorage.getItem('todos')) || []; } catch (e) {}

const list = document.getElementById('list');
const count = document.getElementById('count');
const input = document.getElementById('text');
const prioritySel = document.getElementById('priority');
const dueInput = document.getElementById('due');
const themeBtn = document.getElementById('theme');
const undoBar = document.getElementById('undo');
const RANK = { high: 0, medium: 1, low: 2 };
const VALID_PRIORITIES = new Set(['high', 'medium', 'low']);
const MAX_TEXT_LENGTH = 500;

let filter = 'all';
let editingId = null;
let lastDeleted = null;
let undoTimer = null;

function validatePriority(p) {
  return VALID_PRIORITIES.has(p) ? p : 'medium';
}

function save() {
  try { localStorage.setItem('todos', JSON.stringify(todos)); } catch (e) {}
}

function today() {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local time
}

function render() {
  list.innerHTML = '';
  document.querySelectorAll('#filters [data-filter]').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === filter));

  const visible = todos
    .map(t => ({ ...t, priority: validatePriority(t.priority) }))
    .filter(t => filter === 'all' || (filter === 'done') === t.done)
    .sort((a, b) => RANK[a.priority] - RANK[b.priority] || (a.due || '9999').localeCompare(b.due || '9999'));

  if (visible.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    if (filter === 'done') {
      empty.textContent = 'No completed tasks yet.';
    } else if (filter === 'active') {
      empty.textContent = 'All done! You have no active tasks. 🎉';
    } else {
      empty.textContent = 'No tasks yet. Add one to get started!';
    }
    list.appendChild(empty);
    return;
  }

  visible.forEach(t => {
    const li = document.createElement('li');
    li.className = (t.done ? 'done ' : '') + t.priority;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = t.done;
    cb.setAttribute('aria-label', 'Done');
    cb.onchange = () => { todos.find(x => x.id === t.id).done = cb.checked; save(); render(); };

    const badge = document.createElement('span');
    badge.className = 'badge ' + t.priority;
    badge.textContent = t.priority;

    let textEl;
    if (t.id === editingId) {
      textEl = document.createElement('input');
      textEl.type = 'text';
      textEl.className = 'text';
      textEl.value = t.text;
      const commit = () => {
        if (editingId !== t.id) return;
        editingId = null;
        const v = textEl.value.trim();
        if (v && v.length <= MAX_TEXT_LENGTH) todos.find(x => x.id === t.id).text = v;
        save(); render();
      };
      textEl.onblur = commit;
      textEl.onkeydown = e => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') { editingId = null; render(); }
      };
    } else {
      textEl = document.createElement('span');
      textEl.className = 'text';
      textEl.textContent = t.text;
      textEl.title = 'Double-click to edit';
      textEl.ondblclick = () => { editingId = t.id; render(); };
    }

    li.append(cb, badge, textEl);

    if (t.due) {
      const due = document.createElement('span');
      const overdue = !t.done && t.due < today();
      due.className = 'due' + (overdue ? ' overdue' : '');
      due.textContent = (overdue ? 'Overdue ' : 'Due ') + t.due;
      li.append(due);
    }

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = () => removeTask(t.id);
    li.append(del);

    list.appendChild(li);
    if (t.id === editingId) textEl.focus();
  });

  const left = todos.filter(t => !t.done).length;
  count.textContent = left + (left === 1 ? ' task' : ' tasks') + ' remaining';
}

function removeTask(id) {
  const index = todos.findIndex(x => x.id === id);
  lastDeleted = { todo: todos[index], index };
  todos.splice(index, 1);
  save(); render();
  undoBar.style.display = 'flex';
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndo, 6000);
}

function hideUndo() {
  undoBar.style.display = 'none';
  lastDeleted = null;
}

document.getElementById('undoBtn').onclick = () => {
  if (lastDeleted) {
    todos.splice(lastDeleted.index, 0, lastDeleted.todo);
    save(); render();
  }
  hideUndo();
};

document.getElementById('clear').onclick = () => {
  todos = todos.filter(t => !t.done);
  save(); render();
};

document.getElementById('filters').onclick = e => {
  if (e.target.dataset.filter) { filter = e.target.dataset.filter; render(); }
};

document.getElementById('form').onsubmit = e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || text.length > MAX_TEXT_LENGTH) return;
  todos.push({ id: Date.now(), text, done: false, priority: validatePriority(prioritySel.value), due: dueInput.value || null });
  input.value = '';
  prioritySel.value = 'medium';
  dueInput.value = '';
  save();
  render();
};

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeBtn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  themeBtn.setAttribute('aria-label', themeBtn.title);
  try { localStorage.setItem('theme', theme); } catch (e) {}
}

let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeBtn.onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

render();
