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

// Display random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add some quotes!</p>";
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <p><strong>— ${quote.category}</strong></p>
  `;
}

// Create quote addition form
function createAddQuoteForm() {
  formContainer.innerHTML = `
    <div>
      <h3>Add New Quote</h3>
      <input id="newQuoteText" type="text" placeholder="Enter quote text" />
      <input id="newQuoteCategory" type="text" placeholder="Enter category" />
      <button id="addQuoteBtn">Add Quote</button>
    </div>
  `;
  
  document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
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
  
  quotes.push({ text, category });
  
  // Clear inputs
  textInput.value = '';
  categoryInput.value = '';
  
  alert(`"${text}" added to ${category} quotes!`);
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