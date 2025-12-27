// File: src/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Satpam
const upload = require('../middleware/uploadMiddleware');   // Kuli Angkut

// === PERBAIKAN DISINI ===
// Jangan lupa import getAllFiles juga!
const { uploadFile, getAllFiles } = require('../controllers/fileController'); 

// Rute:

// 1. GET: Ambil daftar semua file (Buat Dashboard)
router.get('/', verifyToken, getAllFiles); 

// 2. POST: Upload File
router.post('/upload', verifyToken, upload.single('file'), uploadFile);

module.exports = router;