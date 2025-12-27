// File: src/routes/fileRoutes.js (Backend)
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadFile, getAllFiles } = require('../controllers/fileController'); 

// Base URL dari index.js sudah: /api/files

// 1. GET: Ambil semua file (Endpoint: /api/files)
router.get('/', verifyToken, getAllFiles); 

// 2. POST: Upload File (Endpoint: /api/files)
// PENTING: Pake '/' aja, JANGAN '/upload'
router.post('/', verifyToken, upload.single('file'), uploadFile);

module.exports = router;
