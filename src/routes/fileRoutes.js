// File: src/routes/fileRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadFile, getAllFiles } = require('../controllers/fileController'); 

// Rute:

// 1. GET: Ambil daftar file (Endpoint: /api/files)
router.get('/', verifyToken, getAllFiles); 

// 2. POST: Upload File (Endpoint: /api/files)
// GANTI '/upload' JADI '/' AJA BIAR GAK RIBET
router.post('/', verifyToken, upload.single('file'), uploadFile);

module.exports = router;
