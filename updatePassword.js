const bcrypt = require('bcrypt');
const User = require('./models/User'); // Sesuaikan path dengan struktur proyek Anda

async function updatePasswords() {
  const users = await User.find(); // Ambil semua user dari database
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10); // Hash ulang password
    user.password = hashedPassword; // Ganti password dengan hash baru
    await user.save(); // Simpan ke database
    console.log(`Updated password for user ${user.email}`);
  }
}

updatePasswords().catch(console.error); // Jalankan fungsi dan tangani error jika ada
