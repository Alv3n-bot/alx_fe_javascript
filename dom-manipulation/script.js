
        // Initial quotes database
        let quotes = [
            { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
            { text: "Innovation distinguishes between a leader and a follower.", category: "Business" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
            { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Perseverance" }
        ];

        // DOM elements
        const quoteDisplay = document.getElementById('quoteDisplay');
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
        const importFile = document.getElementById('importFile');
        const clearSession = document.getElementById('clearSession');
        const clearLocal = document.getElementById('clearLocal');

        // Initialize the application
        function init() {
            // Load quotes from localStorage if available
            loadQuotesFromLocalStorage();
            
            // Check for last quote from session storage
            const lastQuote = sessionStorage.getItem('lastQuote');
            if (lastQuote) {
                const quoteObj = JSON.parse(lastQuote);
                displayQuote(quoteObj);
                showMessage('Welcome back! Showing your last viewed quote from this session.', 'info');
            } else {
                showRandomQuote();
            }
            
            // Set up event listeners
            newQuoteButton.addEventListener('click', showRandomQuote);
            toggleFormButton.addEventListener('click', toggleForm);
            addQuoteBtn.addEventListener('click', addQuote);
            exportBtn.addEventListener('click', exportQuotes);
            importFile.addEventListener('change', importFromJsonFile);
            clearSession.addEventListener('click', clearSessionStorage);
            clearLocal.addEventListener('click', clearLocalStorage);
        }

        // Load quotes from localStorage
        function loadQuotesFromLocalStorage() {
            const storedQuotes = localStorage.getItem('quotes');
            if (storedQuotes) {
                quotes = JSON.parse(storedQuotes);
                showMessage('Loaded quotes from your local storage!', 'success');
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
            
            // Store the quote in sessionStorage
            sessionStorage.setItem('lastQuote', JSON.stringify(quote));
        }

        // Show a random quote
        function showRandomQuote() {
            if (quotes.length === 0) {
                showMessage('No quotes available. Please add some quotes!', 'error');
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
            quotes.push({ text, category });
            
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
            
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotes, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "quotes.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            showMessage('Quotes exported successfully!', 'success');
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
                    if (!Array.isArray(importedQuotes) {
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
                    
                    // Reset the file input
                    event.target.value = '';
                    
                } catch (error) {
                    showMessage(`Error importing quotes: ${error.message}`, 'error');
                }
            };
            fileReader.readAsText(file);
        }

        // Clear session storage
        function clearSessionStorage() {
            sessionStorage.removeItem('lastQuote');
            showMessage('Session quote cleared!', 'success');
        }

        // Clear local storage
        function clearLocalStorage() {
            localStorage.removeItem('quotes');
            quotes = [];
            showMessage('All quotes have been cleared!', 'success');
            quoteText.textContent = 'Click "Show New Quote" to get started!';
            quoteCategory.textContent = '';
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
            
            // Remove message after 3 seconds
            setTimeout(() => {
                if (messageContainer.contains(messageElement)) {
                    messageContainer.removeChild(messageElement);
                }
            }, 3000);
        }

        // Start the application
        document.addEventListener('DOMContentLoaded', init);
 