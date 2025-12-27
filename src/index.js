const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const memoryRoutes = require('./routes/memoryRoutes'); 

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// --- AUTO CREATE FOLDER UPLOADS (SOLUSI CRASH) ---
// Script ini jalan duluan buat ngecek: "Folder uploads ada gak?"
// Kalau gak ada (biasanya di Railway emang kosong), dia bakal bikin otomatis.
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📂 Folder uploads berhasil dibuat otomatis di: ${uploadDir}`);
}
// -------------------------------------------------

// Middleware
app.use(cors());
// Tambahin limit biar gambar resolusi tinggi gak ditolak (10MB)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/memories', memoryRoutes); 

app.get('/', (req, res) => {
  res.send('Server Vault-Memory Jalan!');
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});
