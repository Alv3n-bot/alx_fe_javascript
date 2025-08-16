
        // Server simulation using JSONPlaceholder
        const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
        let syncInterval = null;
        let lastSyncTimestamp = null;
        let conflicts = [];
        
        // Initial quotes database
        let quotes = [
            { id: 1, text: "The only way to do great work is to love what you do.", category: "Inspiration", version: 1 },
            { id: 2, text: "Innovation distinguishes between a leader and a follower.", category: "Business", version: 1 },
            { id: 3, text: "Life is what happens when you're busy making other plans.", category: "Life", version: 1 }
        ];

        // DOM elements
        const quoteText = document.getElementById('quoteText');
        const quoteCategory = document.getElementById('quoteCategory');
        const newQuoteButton = document.getElementById('newQuote');
        const toggleFormButton = document.getElementById('toggleForm');
        const formContainer = document.getElementById('formContainer');
        const addQuoteBtn = document.getElementById('addQuoteBtn');
        const newQuoteText = document.getElementById('newQuoteText');
        const newQuoteCategory = document.getElementById('newQuoteCategory');
        const messageContainer = document.getElementById('messageContainer');
        const exportBtn = document.getElementById('exportBtn');
        const importBtn = document.getElementById('importBtn');
        const clearLocal = document.getElementById('clearLocal');
        const clearServer = document.getElementById('clearServer');
        const manualSync = document.getElementById('manualSync');
        const syncIndicator = document.getElementById('syncIndicator');
        const syncStatus = document.getElementById('syncStatus');
        const lastSync = document.getElementById('lastSync');
        const conflictPanel = document.getElementById('conflictPanel');
        const conflictContainer = document.getElementById('conflictContainer');
        const resolveAllServer = document.getElementById('resolveAllServer');
        const resolveAllLocal = document.getElementById('resolveAllLocal');
        const syncIntervalSelect = document.getElementById('syncInterval');
        const historyContainer = document.getElementById('historyContainer');

        // Initialize the application
        function init() {
            // Load quotes from localStorage if available
            loadQuotesFromLocalStorage();
            
            // Show initial quote
            showRandomQuote();
            
            // Set up event listeners
            setupEventListeners();
            
            // Start auto-sync
            startAutoSync();
            
            // Initial sync with server
            setTimeout(syncWithServer, 1500);
        }

        // Set up event listeners
        function setupEventListeners() {
            newQuoteButton.addEventListener('click', showRandomQuote);
            toggleFormButton.addEventListener('click', toggleForm);
            addQuoteBtn.addEventListener('click', addQuote);
            exportBtn.addEventListener('click', exportQuotes);
            importBtn.addEventListener('click', triggerImport);
            clearLocal.addEventListener('click', clearLocalStorage);
            clearServer.addEventListener('click', resetServerData);
            manualSync.addEventListener('click', syncWithServer);
            resolveAllServer.addEventListener('click', () => resolveAllConflicts('server'));
            resolveAllLocal.addEventListener('click', () => resolveAllConflicts('local'));
            syncIntervalSelect.addEventListener('change', startAutoSync);
        }

        // Load quotes from localStorage
        function loadQuotesFromLocalStorage() {
            const storedQuotes = localStorage.getItem('quotes');
            if (storedQuotes) {
                quotes = JSON.parse(storedQuotes);
                showMessage('Loaded quotes from local storage!', 'success');
            }
        }

        // Save quotes to localStorage
        function saveQuotesToLocalStorage() {
            localStorage.setItem('quotes', JSON.stringify(quotes));
        }

        // Display a quote
        function displayQuote(quote) {
            quoteText.textContent = quote.text;
            quoteCategory.textContent = quote.category;
        }

        // Show a random quote
        function showRandomQuote() {
            if (quotes.length === 0) {
                quoteText.textContent = "No quotes available. Add some quotes!";
                quoteCategory.textContent = "";
                return;
            }
            
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const quote = quotes[randomIndex];
            displayQuote(quote);
        }

        // Toggle the form visibility
        function toggleForm() {
            if (formContainer.style.display === 'none') {
                formContainer.style.display = 'block';
                toggleFormButton.innerHTML = '<i class="fas fa-minus"></i> Hide Form';
            } else {
                formContainer.style.display = 'none';
                toggleFormButton.innerHTML = '<i class="fas fa-plus"></i> Add New Quote';
            }
        }

        // Add a new quote
        function addQuote() {
            const text = newQuoteText.value.trim();
            const category = newQuoteCategory.value.trim();
            
            if (!text || !category) {
                showMessage('Please fill in both fields!', 'error');
                return;
            }
            
            // Add to quotes array
            const newId = Math.max(0, ...quotes.map(q => q.id)) + 1;
            quotes.push({ 
                id: newId, 
                text, 
                category,
                version: 1
            });
            
            // Save to localStorage
            saveQuotesToLocalStorage();
            
            // Clear inputs
            newQuoteText.value = '';
            newQuoteCategory.value = '';
            
            // Show success message
            showMessage(`"${text}" added to ${category} quotes!`, 'success');
            
            // Display the new quote
            displayQuote({ text, category });
        }

        // Export quotes to JSON file
        function exportQuotes() {
            if (quotes.length === 0) {
                showMessage('No quotes to export!', 'error');
                return;
            }
            
            // Create JSON string
            const jsonStr = JSON.stringify(quotes, null, 2);
            
            // Create a Blob with the JSON data
            const blob = new Blob([jsonStr], { type: 'application/json' });
            
            // Create a URL for the blob
            const url = URL.createObjectURL(blob);
            
            // Create a download link
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'quotes.json';
            
            // Append to the document and trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }, 100);
            
            showMessage('Quotes exported successfully!', 'success');
        }

        // Trigger file import
        function triggerImport() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.onchange = importFromJsonFile;
            fileInput.click();
        }

        // Import quotes from JSON file
        function importFromJsonFile(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                try {
                    const importedQuotes = JSON.parse(e.target.result);
                    
                    // Validate the imported data
                    if (!Array.isArray(importedQuotes)) {
                        throw new Error('Invalid format: Expected an array of quotes');
                    }
                    
                    // Add imported quotes to our collection
                    quotes.push(...importedQuotes);
                    
                    // Save to localStorage
                    saveQuotesToLocalStorage();
                    
                    // Show success message
                    showMessage(`${importedQuotes.length} quotes imported successfully!`, 'success');
                    
                    // Show a random imported quote
                    const randomIndex = Math.floor(Math.random() * importedQuotes.length);
                    displayQuote(importedQuotes[randomIndex]);
                    
                } catch (error) {
                    showMessage(`Error importing quotes: ${error.message}`, 'error');
                }
            };
            fileReader.readAsText(file);
        }

        // Clear local storage
        function clearLocalStorage() {
            localStorage.removeItem('quotes');
            quotes = [];
            showMessage('All local quotes have been cleared!', 'success');
            quoteText.textContent = 'Click "Show New Quote" to get started!';
            quoteCategory.textContent = '';
        }

        // Reset server data
        function resetServerData() {
            if (confirm('Are you sure you want to reset server data? This cannot be undone.')) {
                // In a real app, this would call a server endpoint
                showMessage('Server data has been reset!', 'success');
                addHistoryItem('Server data reset');
            }
        }

        // Show a message
        function showMessage(message, type) {
            // Clear any existing messages
            while (messageContainer.firstChild) {
                messageContainer.removeChild(messageContainer.firstChild);
            }
            
            const messageElement = document.createElement('div');
            messageElement.className = `message ${type}`;
            messageElement.textContent = message;
            
            messageContainer.appendChild(messageElement);
            
            // Remove message after 4 seconds
            setTimeout(() => {
                if (messageContainer.contains(messageElement)) {
                    messageContainer.removeChild(messageElement);
                }
            }, 4000);
        }

        // Simulate fetching quotes from server
        async function getServerQuotes() {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // In a real app, this would be:
            // const response = await fetch(SERVER_URL);
            // return await response.json();
            
            // For simulation, we'll return a modified version of local quotes
            const modifiedQuotes = [...quotes];
            
            // Modify 20% of quotes to simulate server changes
            for (let i = 0; i < modifiedQuotes.length; i++) {
                if (Math.random() < 0.2) {
                    modifiedQuotes[i] = {
                        ...modifiedQuotes[i],
                        text: modifiedQuotes[i].text + " (server modified)",
                        version: modifiedQuotes[i].version + 1
                    };
                }
            }
            
            // Add some new quotes occasionally
            if (Math.random() < 0.3) {
                const newId = Math.max(0, ...modifiedQuotes.map(q => q.id)) + 1;
                modifiedQuotes.push({
                    id: newId,
                    text: "New quote added from server sync",
                    category: "Server",
                    version: 1
                });
            }
            
            return modifiedQuotes;
        }

        // Simulate posting quotes to server
        async function postQuotesToServer(quotesToPost) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // In a real app, this would be:
            // const response = await fetch(SERVER_URL, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(quotesToPost)
            // });
            // return await response.json();
            
            // For simulation, just return success
            return { success: true, message: "Quotes updated on server" };
        }

        // Sync with server
        async function syncWithServer() {
            updateSyncStatus('Syncing with server...', 'warning');
            addHistoryItem('Sync started');
            
            try {
                // Step 1: Fetch server quotes
                const serverQuotes = await getServerQuotes();
                
                // Step 2: Compare with local quotes
                const localMap = new Map(quotes.map(q => [q.id, q]));
                const serverMap = new Map(serverQuotes.map(q => [q.id, q]));
                
                // Step 3: Merge changes
                const mergedQuotes = [];
                const detectedConflicts = [];
                const changes = {
                    added: 0,
                    updated: 0,
                    conflicts: 0
                };
                
                // Process server quotes
                for (const serverQuote of serverQuotes) {
                    const localQuote = localMap.get(serverQuote.id);
                    
                    if (localQuote) {
                        // Quote exists in both places
                        if (localQuote.version < serverQuote.version) {
                            // Server has newer version
                            mergedQuotes.push(serverQuote);
                            changes.updated++;
                        } else if (localQuote.version > serverQuote.version) {
                            // Local has newer version - we'll keep it
                            mergedQuotes.push(localQuote);
                            detectedConflicts.push({
                                id: serverQuote.id,
                                local: localQuote,
                                server: serverQuote
                            });
                            changes.conflicts++;
                        } else {
                            // Versions match - no conflict
                            mergedQuotes.push(localQuote);
                        }
                        localMap.delete(serverQuote.id);
                    } else {
                        // New quote from server
                        mergedQuotes.push(serverQuote);
                        changes.added++;
                    }
                }
                
                // Add remaining local quotes not found on server
                for (const localQuote of localMap.values()) {
                    mergedQuotes.push(localQuote);
                }
                
                // Step 4: Update local quotes
                quotes = mergedQuotes;
                saveQuotesToLocalStorage();
                
                // Step 5: Push changes to server
                await postQuotesToServer(mergedQuotes);
                
                // Step 6: Handle conflicts
                if (detectedConflicts.length > 0) {
                    conflicts = detectedConflicts;
                    showConflicts();
                    showMessage(`${detectedConflicts.length} conflicts detected!`, 'warning-msg');
                    updateSyncStatus('Conflicts detected!', 'error');
                } else {
                    // Successful sync
                    lastSyncTimestamp = new Date();
                    updateSyncStatus('Sync successful!', 'success');
                    lastSync.textContent = `Last sync: ${lastSyncTimestamp.toLocaleTimeString()}`;
                    showMessage(`Sync successful! Added ${changes.added} quotes, updated ${changes.updated} quotes.`, 'success');
                }
                
                addHistoryItem(`Sync completed: ${changes.added} added, ${changes.updated} updated, ${changes.conflicts} conflicts`);
                
            } catch (error) {
                updateSyncStatus('Sync failed', 'error');
                showMessage(`Sync failed: ${error.message}`, 'error');
                addHistoryItem('Sync failed');
            }
        }

        // Update sync status UI
        function updateSyncStatus(text, status) {
            syncStatus.textContent = text;
            syncIndicator.className = 'sync-indicator';
            
            if (status === 'success') {
                syncIndicator.classList.add('active');
            } else if (status === 'warning') {
                syncIndicator.style.background = 'var(--warning)';
            } else if (status === 'error') {
                syncIndicator.style.background = 'var(--accent)';
            }
        }

        // Show conflict resolution UI
        function showConflicts() {
            conflictPanel.style.display = 'block';
            conflictContainer.innerHTML = '';
            
            if (conflicts.length === 0) {
                conflictContainer.innerHTML = '<p>No conflicts to resolve.</p>';
                return;
            }
            
            conflicts.forEach(conflict => {
                const conflictEl = document.createElement('div');
                conflictEl.className = 'conflict-item';
                conflictEl.innerHTML = `
                    <h4>Conflict in Quote #${conflict.id}</h4>
                    <div class="version local-version">
                        <strong>Your Version (v${conflict.local.version}):</strong>
                        <p>${conflict.local.text}</p>
                        <p><em>— ${conflict.local.category}</em></p>
                    </div>
                    <div class="version server-version">
                        <strong>Server Version (v${conflict.server.version}):</strong>
                        <p>${conflict.server.text}</p>
                        <p><em>— ${conflict.server.category}</em></p>
                    </div>
                    <div class="resolve-options">
                        <button class="resolve-btn secondary" data-id="${conflict.id}" data-version="local">
                            <i class="fas fa-desktop"></i>
                            Keep My Version
                        </button>
                        <button class="resolve-btn success" data-id="${conflict.id}" data-version="server">
                            <i class="fas fa-server"></i>
                            Use Server Version
                        </button>
                    </div>
                `;
                
                conflictContainer.appendChild(conflictEl);
            });
            
            // Add event listeners to resolve buttons
            document.querySelectorAll('.resolve-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    const version = e.target.dataset.version;
                    resolveConflict(id, version);
                });
            });
        }

        // Resolve a conflict
        function resolveConflict(id, version) {
            const conflictIndex = conflicts.findIndex(c => c.id === id);
            if (conflictIndex === -1) return;
            
            const conflict = conflicts[conflictIndex];
            const quoteIndex = quotes.findIndex(q => q.id === id);
            
            if (quoteIndex !== -1) {
                if (version === 'server') {
                    // Update local quote to server version
                    quotes[quoteIndex] = conflict.server;
                    showMessage(`Conflict resolved: Using server version for quote #${id}`, 'success');
                } else {
                    // Keep local version (but update version number)
                    quotes[quoteIndex].version++;
                    showMessage(`Conflict resolved: Keeping your version for quote #${id}`, 'info');
                }
                
                // Save updated quotes
                saveQuotesToLocalStorage();
            }
            
            // Remove resolved conflict
            conflicts.splice(conflictIndex, 1);
            
            // Update UI
            if (conflicts.length === 0) {
                conflictPanel.style.display = 'none';
                updateSyncStatus('Sync complete', 'success');
                lastSyncTimestamp = new Date();
                lastSync.textContent = `Last sync: ${lastSyncTimestamp.toLocaleTimeString()}`;
            } else {
                showConflicts();
            }
        }

        // Resolve all conflicts
        function resolveAllConflicts(version) {
            conflicts.forEach(conflict => {
                const quoteIndex = quotes.findIndex(q => q.id === conflict.id);
                
                if (quoteIndex !== -1) {
                    if (version === 'server') {
                        quotes[quoteIndex] = conflict.server;
                    } else {
                        quotes[quoteIndex].version++;
                    }
                }
            });
            
            // Save updated quotes
            saveQuotesToLocalStorage();
            
            // Clear conflicts
            conflicts = [];
            conflictPanel.style.display = 'none';
            
            // Update status
            updateSyncStatus('Sync complete', 'success');
            lastSyncTimestamp = new Date();
            lastSync.textContent = `Last sync: ${lastSyncTimestamp.toLocaleTimeString()}`;
            
            showMessage(`All conflicts resolved using ${version === 'server' ? 'server' : 'local'} versions`, 'success');
        }

        // Start auto-sync
        function startAutoSync() {
            // Clear existing interval
            if (syncInterval) {
                clearInterval(syncInterval);
            }
            
            // Get new interval value
            const interval = parseInt(syncIntervalSelect.value) * 1000;
            
            // Set new interval
            syncInterval = setInterval(syncWithServer, interval);
            
            showMessage(`Auto-sync interval set to ${interval/1000} seconds`, 'info');
            addHistoryItem(`Auto-sync interval set to ${interval/1000}s`);
        }

        // Add item to sync history
        function addHistoryItem(text) {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `<span class="time">${timeString}</span> - ${text}`;
            
            historyContainer.prepend(historyItem);
            
            // Limit history to 10 items
            if (historyContainer.children.length > 10) {
                historyContainer.removeChild(historyContainer.lastChild);
            }
        }

        // Start the application
        document.addEventListener('DOMContentLoaded', init);
    