
    // ===== Storage Keys =====
    const LS_KEY = 'dqg_quotes_v1';
    const SS_LAST_ID = 'dqg_last_viewed_id'; // sessionStorage: last viewed quote id

    /** @typedef {{id:string,text:string,author?:string,dateAdded:string}} Quote */

    /** Utils */
    const $ = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
    const uid = () => (crypto?.randomUUID?.() ?? (Date.now().toString(36) + Math.random().toString(36).slice(2)));
    const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1500); };

    /** Default seed quotes (used only if localStorage empty) */
    const SEED = [
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
      { text: 'Whether you think you can, or you think you can\'t—you\'re right.', author: 'Henry Ford' },
      { text: 'It always seems impossible until it\'s done.', author: 'Nelson Mandela' },
    ].map(q => ({ id: uid(), text: q.text, author: q.author, dateAdded: new Date().toISOString() }));

    /** State */
    /** @type {Quote[]} */
    let quotes = [];

    // ===== Load / Save =====
    function loadQuotes() {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return SEED.slice();
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
      } catch (_) {}
      return SEED.slice();
    }

    function saveQuotes() {
      localStorage.setItem(LS_KEY, JSON.stringify(quotes));
      updateStats();
    }

    function updateStats() {
      $('#totalCount').textContent = String(quotes.length);
      const lastId = sessionStorage.getItem(SS_LAST_ID);
      const q = quotes.find(q => q.id === lastId);
      $('#lastViewed').textContent = q ? (q.author ? `${q.author}` : '—') : '—';
    }

    // ===== Rendering =====
    function renderList() {
      const list = $('#list');
      list.innerHTML = '';
      if (quotes.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'muted';
        empty.textContent = 'No quotes yet. Add one or import a JSON file.';
        list.appendChild(empty);
        return;
      }
      for (const q of quotes) {
        const item = document.createElement('div');
        item.className = 'item';

        const grow = document.createElement('div');
        grow.className = 'grow';
        const text = document.createElement('div');
        text.textContent = '“' + q.text + '”';
        const meta = document.createElement('div');
        meta.className = 'meta';
        const when = new Date(q.dateAdded).toLocaleString();
        meta.textContent = (q.author || 'Unknown') + ' • ' + when;
        grow.appendChild(text); grow.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'actions';
        const btnUse = document.createElement('button');
        btnUse.className = 'btn'; btnUse.textContent = 'Show';
        btnUse.onclick = () => showQuote(q);
        const btnEdit = document.createElement('button');
        btnEdit.className = 'btn'; btnEdit.textContent = 'Edit';
        btnEdit.onclick = () => editQuote(q.id);
        const btnDel = document.createElement('button');
        btnDel.className = 'btn danger'; btnDel.textContent = 'Delete';
        btnDel.onclick = () => deleteQuote(q.id);
        actions.append(btnUse, btnEdit, btnDel);

        item.append(grow, actions);
        list.appendChild(item);
      }
    }

    function showQuote(q) {
      $('#currentQuote').textContent = q ? '“' + q.text + '”' : 'No quote.';
      $('#currentAuthor').textContent = q?.author ? '— ' + q.author : '';
      if (q) sessionStorage.setItem(SS_LAST_ID, q.id);
      updateStats();
    }

    function showRandom() {
      if (quotes.length === 0) { showQuote(null); return; }
      const last = sessionStorage.getItem(SS_LAST_ID);
      let pick = quotes[Math.floor(Math.random() * quotes.length)];
      if (quotes.length > 1 && pick.id === last) {
        // try one more time to avoid repeat in a row
        pick = quotes[Math.floor(Math.random() * quotes.length)];
      }
      showQuote(pick);
    }

    // ===== CRUD =====
    function addQuote(e) {
      e.preventDefault();
      const text = $('#quoteText').value.trim();
      const author = $('#quoteAuthor').value.trim();
      if (!text) { $('#formStatus').textContent = 'Please enter a quote.'; return; }
      const q = { id: uid(), text, author: author || undefined, dateAdded: new Date().toISOString() };
      quotes.unshift(q);
      saveQuotes();
      renderList();
      showQuote(q);
      e.target.reset();
      $('#formStatus').textContent = '';
      toast('Quote added');
    }

    function editQuote(id) {
      const idx = quotes.findIndex(q => q.id === id);
      if (idx === -1) return;
      const q = quotes[idx];
      const newText = prompt('Edit quote text:', q.text);
      if (newText === null) return; // cancel
      const newAuthor = prompt('Edit author (optional):', q.author || '');
      quotes[idx] = { ...q, text: newText.trim() || q.text, author: (newAuthor?.trim() || undefined) };
      saveQuotes();
      renderList();
      const last = sessionStorage.getItem(SS_LAST_ID);
      if (last === id) showQuote(quotes[idx]);
      toast('Quote updated');
    }

    function deleteQuote(id) {
      if (!confirm('Delete this quote?')) return;
      const idx = quotes.findIndex(q => q.id === id);
      if (idx === -1) return;
      quotes.splice(idx, 1);
      saveQuotes();
      renderList();
      const last = sessionStorage.getItem(SS_LAST_ID);
      if (last === id) { sessionStorage.removeItem(SS_LAST_ID); showRandom(); }
      toast('Quote deleted');
    }

    function clearAll() {
      if (!confirm('Clear ALL quotes? This cannot be undone.')) return;
      quotes = [];
      saveQuotes();
      renderList();
      sessionStorage.removeItem(SS_LAST_ID);
      showQuote(null);
      toast('All quotes cleared');
    }

    // ===== Export / Import =====
    function exportToJson() {
      const data = JSON.stringify(quotes, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dt = new Date().toISOString().slice(0,10);
      a.download = `quotes-${dt}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('Exported JSON');
    }

    // Provided signature in task (enhanced with validation & de-duplication)
    function importFromJsonFile(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.json')) { alert('Please select a .json file.'); return; }
      const fileReader = new FileReader();
      fileReader.onload = function(ev) {
        try {
          const raw = ev.target.result;
          const parsed = JSON.parse(raw);
          let incoming = [];
          if (Array.isArray(parsed)) {
            // Accept array of strings or array of objects
            incoming = parsed.map(x => {
              if (typeof x === 'string') return { id: uid(), text: x, author: undefined, dateAdded: new Date().toISOString() };
              if (x && typeof x === 'object') {
                return {
                  id: x.id || uid(),
                  text: String(x.text ?? '').trim(),
                  author: x.author ? String(x.author).trim() : undefined,
                  dateAdded: x.dateAdded || new Date().toISOString(),
                };
              }
              return null;
            }).filter(Boolean);
          } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.quotes)) {
            // Support { quotes: [...] }
            incoming = parsed.quotes.map(x => ({ id: x.id || uid(), text: String(x.text ?? '').trim(), author: x.author ? String(x.author).trim() : undefined, dateAdded: x.dateAdded || new Date().toISOString() }));
          } else {
            throw new Error('Invalid JSON format. Expected an array or an object with a "quotes" array.');
          }

          // Remove empties
          incoming = incoming.filter(q => q.text);

          // De-duplicate by text+author
          const key = q => (q.text.toLowerCase() + '|' + (q.author?.toLowerCase() || ''));
          const existingKeys = new Set(quotes.map(key));
          const toAdd = incoming.filter(q => !existingKeys.has(key(q)));

          if (toAdd.length === 0) { alert('No new quotes to import (all duplicates).'); return; }

          quotes.unshift(...toAdd);
          saveQuotes();
          renderList();
          showQuote(toAdd[0]);
          alert('Quotes imported successfully! Added: ' + toAdd.length);
        } catch (err) {
          console.error(err);
          alert('Failed to import JSON: ' + (err.message || err));
        } finally {
          // clear input so same file can be re-selected
          event.target.value = '';
        }
      };
      fileReader.readAsText(file);
    }

    // ===== Clipboard =====
    async function copyCurrent() {
      const text = $('#currentQuote').textContent?.replace(/^“|”$/g, '') || '';
      const author = $('#currentAuthor').textContent?.replace(/^—\s*/, '') || '';
      const payload = author ? `${text} — ${author}` : text;
      try { await navigator.clipboard.writeText(payload); toast('Copied to clipboard'); }
      catch { toast('Copy failed'); }
    }

    // ===== Event bindings =====
    function bindEvents() {
      $('#addForm').addEventListener('submit', addQuote);
      $('#btnRandom').addEventListener('click', showRandom);
      $('#btnCopy').addEventListener('click', copyCurrent);
      $('#btnExport').addEventListener('click', exportToJson);
      $('#importFile').addEventListener('change', importFromJsonFile);
      $('#btnClear').addEventListener('click', clearAll);
    }

    // ===== Init =====
    function init() {
      quotes = loadQuotes();
      bindEvents();
      updateStats();
      renderList();
      const lastId = sessionStorage.getItem(SS_LAST_ID);
      const last = quotes.find(q => q.id === lastId);
      if (last) showQuote(last); else showRandom();
    }

    init();

    // ===== Manual test checklist (open DevTools Console to run snippets) =====
    // 1) Add a quote -> persists after refresh.
    // 2) Click Export -> downloads JSON file.
    // 3) Clear All -> list empty; Import exported file -> restored.
    // 4) Import array of strings, e.g. ["Hello world", "Stay hungry"] -> converts OK.
    // 5) Session: Click Next Random, refresh page in same tab -> last viewed author appears in header.
    // 6) Edit/Delete items; if last viewed was edited/deleted, viewer updates accordingly.
 