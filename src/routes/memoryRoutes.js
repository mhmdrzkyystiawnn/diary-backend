// File: src/routes/memoryRoutes.js
const express = require('express');
const router = express.Router(); // <--- Nah, router didefinisikan disini!
const verifyToken = require('../middleware/authMiddleware');

// Import Controller
const { 
    addMemory, 
    getFileDetail, 
    addTimestampNote, 
    deleteTimestampNote 
} = require('../controllers/memoryController');

// === DAFTAR ROUTE ===

// 1. Diary Utama
router.post('/', verifyToken, addMemory);
router.get('/:fileId', verifyToken, getFileDetail);

// 2. Audio Timestamp Note (Komentar Detik)
router.post('/note', verifyToken, addTimestampNote);
router.delete('/note/:noteId', verifyToken, deleteTimestampNote);

module.exports = router;