require("dotenv").config();
const jwt = require("jsonwebtoken");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGMyYWI0MzcyZTE3ODJmNzExMTAyNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MzA3Mjc5MCwiZXhwIjoxNzQ1NjY0NzkwfQ.8HZ7HXuBJ2MxvbH1SSEfW7huGSwWPg3JlKhAoIXndZ4";  // Replace with your actual token

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("✅ Verified Token:", decoded);
} catch (error) {
  console.error("❌ Token verification failed:", error.message);
}
