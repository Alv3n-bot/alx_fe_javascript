// Initial quotes
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Do one thing every day that scares you.", category: "Inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "Philosophy" },
  { text: "Opportunities don’t happen. You create them.", category: "Success" }
];

// Function to show a random quote
function showRandomQuote() {
  let randomIndex = Math.floor(Math.random() * quotes.length);
  let randomQuote = quotes[randomIndex];
  
  document.getElementById("quoteDisplay").innerText = 
    `"${randomQuote.text}" — ${randomQuote.category}`;
}

// Add new quote from input fields
function addQuote() {
  let newText = document.getElementById("newQuoteText").value;
  let newCategory = document.getElementById("newQuoteCategory").value;

  if (newText.trim() === "" || newCategory.trim() === "") {
    alert("Please fill both the quote and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// Event listener for button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Show first random quote on load
showRandomQuote();
