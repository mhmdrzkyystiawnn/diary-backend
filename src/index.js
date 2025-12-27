// File: src/index.js (Backend)
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

// --- 1. AUTO CREATE FOLDER (Anti Crash) ---
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📂 Folder uploads dibuat di: ${uploadDir}`);
}

// --- 2. CORS (JURUS ANTI BLOKIR) ---
// Kita izinkan semua origin (*) biar Vercel lu gak ditolak
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware Body Parser (Biar bisa baca JSON & Form)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Folder Uploads biar bisa diakses lewat URL (http://.../uploads/foto.jpg)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes); // <--- Perhatikan ini
app.use('/api/memories', memoryRoutes); 

app.get('/', (req, res) => {
  res.send('Server Vault-Memory Online & Siap!');
});

app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
