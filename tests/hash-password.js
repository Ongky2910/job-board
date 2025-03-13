const bcrypt = require('bcrypt');

// Ambil password dari request login dan hash yang ada di DB
const passwordInput = "Permana123";  
const hashFromDb = "$2b$10$NRv0QLOYIVpO8OSL65SeVusiMDkM1P2t9sYU/0KH./eIHTGyMNSdC";  // Hash yang ada di database

bcrypt.compare(passwordInput, hashFromDb, (err, isMatch) => {
  if (err) {
    console.error('Error comparing password:', err);
    return;
  }
  console.log('Password valid:', isMatch);  
});
