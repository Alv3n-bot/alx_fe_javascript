
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
                toggleFormButton.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14"></path>
                    </svg>
                    Hide Form
                `;
            } else {
                formContainer.style.display = 'none';
                toggleFormButton.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14"></path>
                        <path d="M5 12h14"></path>
                    </svg>
                    Add New Quote
                `;
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

        // Sync with server
        async function syncWithServer() {
            updateSyncStatus('Syncing with server...', 'warning');
            
            try {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // In a real app, we would fetch and merge server data
                // For simulation, we'll generate some conflicts occasionally
                if (Math.random() > 0.7) {
                    generateSimulatedConflicts();
                    showConflicts();
                } else {
                    // Successful sync
                    lastSyncTimestamp = new Date();
                    updateSyncStatus('Sync successful!', 'success');
                    lastSync.textContent = `Last sync: ${lastSyncTimestamp.toLocaleTimeString()}`;
                    showMessage('Data synchronized successfully with server.', 'success');
                    addHistoryItem('Sync successful');
                }
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

        // Generate simulated conflicts for demonstration
        function generateSimulatedConflicts() {
            conflicts = [];
            
            if (quotes.length > 0) {
                // Create a conflict for the first quote
                const quote = {...quotes[0]};
                const serverVersion = {
                    ...quote,
                    text: quote.text.replace('work', 'life'),
                    version: quote.version + 1
                };
                
                conflicts.push({
                    id: quote.id,
                    local: quote,
                    server: serverVersion
                });
                
                // Create another conflict
                if (quotes.length > 1) {
                    const quote2 = {...quotes[1]};
                    const serverVersion2 = {
                        ...quote2,
                        category: 'Leadership',
                        version: quote2.version + 1
                    };
                    
                    conflicts.push({
                        id: quote2.id,
                        local: quote2,
                        server: serverVersion2
                    });
                }
            }
            
            updateSyncStatus('Conflicts detected!', 'error');
            showMessage('Conflicts detected between local and server data!', 'warning-msg');
            addHistoryItem('Sync completed with conflicts');
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
                        <strong>Your Version:</strong>
                        <p>${conflict.local.text}</p>
                        <p><em>— ${conflict.local.category}</em></p>
                    </div>
                    <div class="version server-version">
                        <strong>Server Version:</strong>
                        <p>${conflict.server.text}</p>
                        <p><em>— ${conflict.server.category}</em></p>
                    </div>
                    <div class="resolve-options">
                        <button class="resolve-btn secondary" data-id="${conflict.id}" data-version="local">Keep My Version</button>
                        <button class="resolve-btn success" data-id="${conflict.id}" data-version="server">Use Server Version</button>
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
  