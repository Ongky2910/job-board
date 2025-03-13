const bcrypt = require('bcrypt');

// Password yang dimasukkan oleh pengguna
const passwordInput = 'Permana123';

// Hash password yang ada di database
const hashFromDb = '$2b$10$NRv0QLOYIVpO8OSL65SeVusiMDkM1P2t9sYU/0KH./eIHTGyMNSdC'; 

bcrypt.compare(passwordInput, hashFromDb, (err, isMatch) => {
  if (err) throw err;
  console.log('Password valid:', isMatch);
});
