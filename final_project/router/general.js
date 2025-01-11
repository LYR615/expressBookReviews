const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  try {
    const { username, password } = req.body; // Extract username and password from the request body

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" }); // 409 Conflict
    }

    // Add the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" }); // 201 Created
  } catch (error) {
    res.status(500).json({ message: "An error occurred while registering the user" });
  }
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   try {
//     res.status(200).send(JSON.stringify(books, null, 2)); 
//   } catch (error) {
//     res.status(500).send({ message: "An error occurred while retrieving books." });
//   }  
// });

public_users.get('/',function (req, res) {
  new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("Books not found");
    }
  })
    .then((data) => res.status(200).send(JSON.stringify(data, null, 2)))
    .catch((error) => res.status(500).send({ message: error }));
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn', function (req, res) {
//   try {
//     const isbn = req.params.isbn; // Extract ISBN from the route parameter
//     if (books[isbn]) {
//       res.status(200).send(books[isbn]); // Send the book details if found
//     } else {
//       res.status(404).send({ message: "Book not found" }); // Send 404 if ISBN does not exist
//     }
//   } catch (error) {
//     res.status(500).send({ message: "An error occurred while retrieving the book details." });
//   }
// });
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  })
    .then((data) => res.status(200).send(data))
    .catch((error) => res.status(404).send({ message: error }));
});


// Get book details based on author
// public_users.get('/author/:author', function (req, res) {
//   try {
//     const author = req.params.author; // Extract author from the route parameter
//     const keys = Object.keys(books); // Get all keys from the 'books' object

//     // Filter books by matching author
//     const booksByAuthor = keys
//       .map(key => books[key]) // Map keys to book objects
//       .filter(book => book.author.toLowerCase() === author.toLowerCase()); // Match author (case-insensitive)

//     if (booksByAuthor.length > 0) {
//       res.status(200).send(booksByAuthor); // Send the matching books
//     } else {
//       res.status(404).send({ message: "No books found for the given author" }); // Send 404 if no matches
//     }
//   } catch (error) {
//     res.status(500).send({ message: "An error occurred while retrieving books by the author." });
//   }
// });
public_users.get('/author/:author', function (req, res){
  const author = req.params.author.toLowerCase();;

  new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const booksByAuthor = keys
      .map(key => books[key])
      .filter(book => book.author.toLowerCase() === author);

    if (booksByAuthor.length > 0){
      resolve(booksByAuthor);
    }
    else{
      reject("No books found for the given author"); 
    }
  })
  .then((data) => res.status(200).send(data))
  .catch((error) => res.status(404).send({ message: error }));
})

// Get all books based on title
// public_users.get('/title/:title', function (req, res) {
//   try {
//     const title = req.params.title; // Extract title from the route parameter
//     const keys = Object.keys(books); // Get all keys from the 'books' object

//     // Filter books by matching title
//     const booksByTitle = keys
//       .map(key => books[key]) // Map keys to book objects
//       .filter(book => book.title.toLowerCase() === title.toLowerCase()); // Match title (case-insensitive)

//     if (booksByTitle.length > 0) {
//       res.status(200).send(booksByTitle); // Send the matching books
//     } else {
//       res.status(404).send({ message: "No books found with the given title" }); // Send 404 if no matches
//     }
//   } catch (error) {
//     res.status(500).send({ message: "An error occurred while retrieving books by title." });
//   }
// });
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    const booksByTitle = keys
      .map(key => books[key])
      .filter(book => book.title.toLowerCase() === title);
    
    if (booksByTitle.length > 0){
      resolve(booksByTitle);
    }else{
      reject("No books found with the given title");
    }
  })
  .then((data) => res.status(200).send(data))
  .catch((error) => res.status(404).send({ message: error }));
})

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  try {
    const isbn = req.params.isbn; // Extract ISBN from the route parameter

    if (books[isbn]) {
      const reviews = books[isbn].reviews; // Get reviews of the book
      res.status(200).send(reviews); // Send the reviews as a response
    } else {
      res.status(404).send({ message: "Book not found" }); // Send 404 if the book doesn't exist
    }
  } catch (error) {
    res.status(500).send({ message: "An error occurred while retrieving the book reviews." });
  }
});

module.exports.general = public_users;
