const bcrypt = require('bcrypt');

// Password yang dimasukkan oleh pengguna
const passwordInput = 'Permana123';

// Hash password yang ada di database
const hashFromDb = '$2b$10$f5v0MQhyzNRQybu3FdoEHOW/17kBZ2Wxkwu6xOd9QnZELztOSkRsW';  // Contoh hash yang kamu simpan di DB

bcrypt.compare(passwordInput, hashFromDb, (err, isMatch) => {
  if (err) throw err;
  console.log('Password valid:', isMatch);  // true jika valid, false jika tidak cocok
});
