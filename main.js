import './style.css'

const STORAGE_KEY = 'expense-tracker-data'

const CATEGORIES = [
  { id: 'food', label: 'Food & Dining' },
  { id: 'transport', label: 'Transport' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'bills', label: 'Bills & Utilities' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'health', label: 'Health' },
  { id: 'other', label: 'Other' },
]

const CATEGORY_COLORS = {
  food: '#f97316',
  transport: '#0ea5e9',
  shopping: '#ec4899',
  bills: '#eab308',
  entertainment: '#8b5cf6',
  health: '#10b981',
  other: '#64748b',
}

function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

let expenses = loadExpenses()

const app = document.querySelector('#app')

function render() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  app.innerHTML = `
    <div class="container">
      <header class="header">
        <h1>Expense Tracker</h1>
        <p class="subtitle">Track your spending, stay on budget.</p>
      </header>

      <section class="summary">
        <div class="total-card">
          <span class="total-label">Total Spent</span>
          <span class="total-amount">₹${total.toFixed(2)}</span>
          <span class="total-count">${expenses.length} expense${expenses.length === 1 ? '' : 's'}</span>
        </div>
      </section>

      <section class="form-section">
        <h2>Add an Expense</h2>
        <form id="expense-form" class="expense-form" novalidate>
          <div class="field">
            <label for="expense-name">Name</label>
            <input type="text" id="expense-name" name="name" placeholder="e.g. Lunch with friends" required />
          </div>
          <div class="field">
            <label for="expense-amount">Amount (₹)</label>
            <input type="number" id="expense-amount" name="amount" placeholder="0.00" step="0.01" min="0.01" required />
          </div>
          <div class="field">
            <label for="expense-category">Category</label>
            <select id="expense-category" name="category" required>
              ${CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}
            </select>
          </div>
          <button type="submit" class="add-btn">Add Expense</button>
          <p id="form-error" class="form-error" hidden></p>
        </form>
      </section>

      <section class="list-section">
        <div class="list-header">
          <h2>Your Expenses</h2>
          ${expenses.length > 0 ? '<button id="clear-all" class="clear-all-btn">Clear All</button>' : ''}
        </div>
        ${
          expenses.length === 0
            ? '<div class="empty-state"><p>No expenses yet.</p><p class="empty-hint">Add your first expense above to get started.</p></div>'
            : `<ul class="expense-list">
                ${expenses
                  .map(
                    (e) => `
                  <li class="expense-item" data-id="${e.id}">
                    <span class="category-dot" style="background:${CATEGORY_COLORS[e.category] || '#64748b'}"></span>
                    <div class="expense-info">
                      <span class="expense-name">${escapeHtml(e.name)}</span>
                      <span class="expense-meta">${CATEGORIES.find((c) => c.id === e.category)?.label || 'Other'} · ${formatDate(e.date)}</span>
                    </div>
                    <span class="expense-amount">₹${e.amount.toFixed(2)}</span>
                    <button class="delete-btn" data-id="${e.id}" aria-label="Delete expense">✕</button>
                  </li>
                `
                  )
                  .join('')}
              </ul>`
        }
      </section>
    </div>
  `

  document.getElementById('expense-form').addEventListener('submit', handleAdd)
  document.getElementById('clear-all')?.addEventListener('click', handleClearAll)
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.id))
  })
}

function handleAdd(e) {
  e.preventDefault()
  const form = e.target
  const errorEl = document.getElementById('form-error')

  const name = form.name.value.trim()
  const amount = parseFloat(form.amount.value)
  const category = form.category.value

  if (!name) {
    showError(errorEl, 'Please enter a name for your expense.')
    form.name.focus()
    return
  }
  if (!amount || amount <= 0 || isNaN(amount)) {
    showError(errorEl, 'Please enter a valid amount greater than zero.')
    form.amount.focus()
    return
  }

  expenses.unshift({
    id: crypto.randomUUID(),
    name,
    amount,
    category,
    date: new Date().toISOString(),
  })
  saveExpenses(expenses)
  render()
}

function handleDelete(id) {
  expenses = expenses.filter((e) => e.id !== id)
  saveExpenses(expenses)
  render()
}

function handleClearAll() {
  if (confirm('Remove all expenses? This cannot be undone.')) {
    expenses = []
    saveExpenses(expenses)
    render()
  }
}

function showError(el, message) {
  el.textContent = message
  el.hidden = false
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

render()
