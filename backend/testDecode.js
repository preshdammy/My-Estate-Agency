const jwt = require("jsonwebtoken");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGMyYWI0MzcyZTE3ODJmNzExMTAyNSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MzA3MjM2NiwiZXhwIjoxNzQ1NjY0MzY2fQ.lA8t7OxvZYtFJ-XvLm5Qi64A7PoPInzUXMtSdOhRcT0"; 
const decoded = jwt.decode(token);
console.log("Decoded Token:", decoded);
