// Initial quotes database
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Business" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const formContainer = document.getElementById('formContainer');

// Display random quote using DOM manipulation
function showRandomQuote() {
    // Clear previous content
    while (quoteDisplay.firstChild) {
        quoteDisplay.removeChild(quoteDisplay.firstChild);
    }

    if (quotes.length === 0) {
        const message = document.createElement('p');
        message.textContent = "No quotes available. Add some quotes!";
        quoteDisplay.appendChild(message);
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    // Create quote elements
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${quote.text}"`;
    
    const quoteCategory = document.createElement('p');
    quoteCategory.innerHTML = `<strong>— ${quote.category}</strong>`;

    // Append to display
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
}

// Create quote addition form using DOM manipulation
function createAddQuoteForm() {
    // Create form elements
    const formDiv = document.createElement('div');
    
    const heading = document.createElement('h3');
    heading.textContent = "Add New Quote";
    
    const textInput = document.createElement('input');
    textInput.type = "text";
    textInput.id = "newQuoteText";
    textInput.placeholder = "Enter quote text";
    
    const categoryInput = document.createElement('input');
    categoryInput.type = "text";
    categoryInput.id = "newQuoteCategory";
    categoryInput.placeholder = "Enter category";
    
    const addButton = document.createElement('button');
    addButton.textContent = "Add Quote";
    addButton.addEventListener('click', addQuote);

    // Build form structure
    formDiv.appendChild(heading);
    formDiv.appendChild(textInput);
    formDiv.appendChild(categoryInput);
    formDiv.appendChild(addButton);
    
    // Clear container and add form
    formContainer.innerHTML = '';
    formContainer.appendChild(formDiv);
}

// Add new quote to database
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();
    
    if (!text || !category) {
        alert("Please fill in both fields!");
        return;
    }
    
    // Add to quotes array
    quotes.push({ text, category });
    
    // Clear inputs
    textInput.value = '';
    categoryInput.value = '';
    
    // Show success message
    const message = document.createElement('p');
    message.textContent = `"${text}" added to ${category} quotes!`;
    message.style.color = 'green';
    message.style.marginTop = '10px';
    
    formContainer.appendChild(message);
    
    // Remove message after 2 seconds
    setTimeout(() => {
        if (formContainer.contains(message)) {
            formContainer.removeChild(message);
        }
    }, 2000);
}

// Initialize application
function init() {
    showRandomQuote();
    createAddQuoteForm();
    
    // Event listeners
    newQuoteButton.addEventListener('click', showRandomQuote);
}

// Start the app when DOM loads
document.addEventListener('DOMContentLoaded', init);