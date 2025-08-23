// ===== Storage keys =====
const LS_QUOTES_KEY = "quotes";
const LS_LAST_FILTER_KEY = "lastCategory";

// ===== Data =====
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "Philosophy" },
];

// ===== Utility: load/save =====
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) quotes = parsed;
    }
  } catch (e) {
    console.error("Failed to load quotes:", e);
  }
}

function saveQuotes() {
  try {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error("Failed to save quotes:", e);
  }
}

// ===== Helpers =====
function uniqueCategories() {
  const cats = new Set(
    quotes
      .map(q => (q.category || "").trim())
      .filter(Boolean)
  );
  return Array.from(cats).sort((a, b) => a.localeCompare(b));
}

// ===== DOM updaters =====
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  // Rebuild options
  select.innerHTML = ""; // clear all
  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.textContent = "All Categories";
  select.appendChild(optAll);

  uniqueCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  // Restore last-selected category (if any)
  const last = localStorage.getItem(LS_LAST_FILTER_KEY) || "all";
  if ([...select.options].some(o => o.value === last)) {
    select.value = last;
  } else {
    select.value = "all";
  }
}

function renderFilteredList() {
  const container = document.getElementById("quotesList");
  const select = document.getElementById("categoryFilter");
  if (!container || !select) return;

  const chosen = select.value;
  const filtered = chosen === "all"
    ? quotes
    : quotes.filter(q => q.category === chosen);

  container.innerHTML = "";
  if (!filtered.length) {
    container.textContent = "No quotes for this category yet.";
    return;
  }

  const ul = document.createElement("ul");
  filtered.forEach(q => {
    const li = document.createElement("li");
    li.textContent = `"${q.text}" — ${q.category}`;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

// ===== Core features =====
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const select = document.getElementById("categoryFilter");

  const pool = (select && select.value !== "all")
    ? quotes.filter(q => q.category === select.value)
    : quotes;

  if (!pool.length) {
    display.textContent = "No quotes available. Add one below!";
    return;
  }

  const idx = Math.floor(Math.random() * pool.length);
  const q = pool[idx];
  display.textContent = `"${q.text}" — ${q.category}`;
}

function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = (textEl.value || "").trim();
  const category = (catEl.value || "").trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  // Clear inputs
  textEl.value = "";
  catEl.value = "";

  // Update categories (in case a new one was introduced)
  const prevSelected = document.getElementById("categoryFilter").value;
  populateCategories();

  // Keep the previous selection if still present, else switch to the new category
  const select = document.getElementById("categoryFilter");
  if ([...select.options].some(o => o.value === prevSelected)) {
    select.value = prevSelected;
  } else {
    select.value = category;
  }
  localStorage.setItem(LS_LAST_FILTER_KEY, select.value);

  // Refresh list and random
  renderFilteredList();
  showRandomQuote();

  alert("Quote added successfully!");
}

function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;
  localStorage.setItem(LS_LAST_FILTER_KEY, select.value);
  renderFilteredList();
  showRandomQuote();
}

// ===== Boot =====
document.addEventListener("DOMContentLoaded", () => {
  // Load persisted quotes first
  loadQuotes();

  // Wire button
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  // Build UI
  populateCategories();
  renderFilteredList();
  showRandomQuote();
});
