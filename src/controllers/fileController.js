// File: src/controllers/fileController.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs'); // Buat baca/hapus file
const crypto = require('crypto'); // Buat bikin hash (sidik jari file)
const prisma = new PrismaClient();

const uploadFile = async (req, res) => {
  try {
    // 1. Cek apakah ada file yang dikirim?
    if (!req.file) {
      return res.status(400).json({ msg: "Mana filenya? Upload gagal." });
    }

    const fileData = req.file;
    const userId = req.user.id; // Didapat dari token (middleware)

    // 2. HITUNG HASH (SIDIK JARI FILE)
    // Ini fitur canggih: Kita baca file fisik, lalu hitung kode uniknya.
    const fileBuffer = fs.readFileSync(fileData.path);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hexHash = hashSum.digest('hex');

    // 3. CEK DEDUPLIKASI (Apakah file ini sudah pernah diupload?)
    const existingFile = await prisma.file.findFirst({
      where: { 
        fileHash: hexHash,
        userId: userId // Cek cuma di galeri user ini aja
      }
    });

    if (existingFile) {
      // Kalau file sudah ada, hapus file baru yang barusan diupload (Hemat Storage)
      fs.unlinkSync(fileData.path);
      return res.status(200).json({ 
        msg: "File ini sudah ada di Vault kamu!", 
        data: existingFile 
      });
    }

    // 4. TENTUKAN TIPE FILE (Photo/Audio/Video)
    let fileType = 'OTHER';
    if (fileData.mimetype.startsWith('image/')) fileType = 'PHOTO';
    else if (fileData.mimetype.startsWith('audio/')) fileType = 'AUDIO';
    else if (fileData.mimetype.startsWith('video/')) fileType = 'VIDEO';
    else if (fileData.mimetype === 'application/zip') fileType = 'ARCHIVE';
    else if (fileData.mimetype === 'application/pdf') fileType = 'DOCUMENT';

    // 5. SIMPAN DATA KE DATABASE
    const newFile = await prisma.file.create({
      data: {
        originalName: fileData.originalname,
        filename: fileData.filename,
        path: fileData.path,
        mimeType: fileData.mimetype,
        size: fileData.size,
        fileHash: hexHash, // Simpan sidik jarinya
        type: fileType,
        userId: userId,
        metadata: {} // Nanti bisa diisi durasi video dll
      }
    });

    res.status(201).json({
      msg: "Upload Berhasil! File tersimpan aman.",
      data: newFile
    });

  } catch (error) {
    console.error("Upload Error:", error);
    // Kalau error, hapus file yang kepalang ke-upload biar gak nyampah
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ msg: "Gagal memproses file." });
  }
};

// === TAMBAHAN BARU: AMBIL SEMUA FILE ===
const getAllFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Ambil semua file milik user ini, urutkan dari yang terbaru
    const files = await prisma.file.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' } 
    });

    res.json({ data: files });
  } catch (error) {
    res.status(500).json({ msg: "Gagal mengambil daftar file." });
  }
};

module.exports = { uploadFile, getAllFiles }; 