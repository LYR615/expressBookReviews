const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  console.log("Existing users:", users); // 打印出当前的用户数组
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username exists
  if (!isValid(username)) {
    return res.status(404).json({ message: "Username is not valid" });
  }

  // Check if username and password match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const accessToken = jwt.sign(
    { username },
    "access", // Secret key for signing the token
    { expiresIn: '1h' } // Token expiration time
  );

  // Save the token in the session
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "Login successful", accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn; // Extract the ISBN from the URL
    const { review } = req.body; // Extract the review from the request body
    const username = req.session.authorization?.username; // Extract username from session

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
      return res.status(400).json({ message: "Review content is required" });
    }

    // Add or modify the review
    if (!books[isbn].reviews) {
      books[isbn].reviews = {}; // Initialize reviews object if it doesn't exist
    }

    books[isbn].reviews[username] = review; // Add or update the review for this user

    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while adding/modifying the review" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn; // Extract the ISBN from the URL
    const username = req.session.authorization?.username; // Extract username from session

    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the book has reviews
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for the logged-in user" });
    }

    // Delete the review for the logged-in user
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred while deleting the review" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
