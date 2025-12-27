// File: src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Atur tempat penyimpanan (Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Simpan di folder 'uploads' yang tadi kamu buat
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Ubah nama file biar gak bentrok
    // Format: timestamp-angkaacak.extensi
    // Contoh: 17098822_992.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter File (Opsional: Biar user gak upload file .exe virus)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/mp3', 'video/mp4', 'application/pdf', 'application/zip'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Terima
  } else {
    cb(new Error('Tipe file tidak didukung!'), false); // Tolak
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Maksimal 50MB per file
});

module.exports = upload;