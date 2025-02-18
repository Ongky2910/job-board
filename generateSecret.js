const crypto = require("crypto");

// Generate a random secret key for JWT
const jwtSecret = crypto.randomBytes(64).toString("hex");
console.log(jwtSecret);
