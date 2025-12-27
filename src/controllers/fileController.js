const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path'); // Tambahan buat ngerapihin path
const prisma = new PrismaClient();

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "Mana filenya? Upload gagal." });
    }

    const fileData = req.file;
    const userId = req.user.id;

    // 2. HITUNG HASH (SIDIK JARI FILE)
    // Kita baca file fisik, lalu hitung kode uniknya.
    const fileBuffer = fs.readFileSync(fileData.path);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hexHash = hashSum.digest('hex');

    // 3. CEK DEDUPLIKASI
    const existingFile = await prisma.file.findFirst({
      where: { 
        fileHash: hexHash,
        userId: userId 
      }
    });

    if (existingFile) {
      // Hapus file duplikat fisik biar hemat storage
      if (fs.existsSync(fileData.path)) fs.unlinkSync(fileData.path);
      
      return res.status(200).json({ 
        msg: "File ini sudah ada di Vault kamu!", 
        data: existingFile 
      });
    }

    // 4. TENTUKAN TIPE FILE
    let fileType = 'OTHER';
    if (fileData.mimetype.startsWith('image/')) fileType = 'PHOTO';
    else if (fileData.mimetype.startsWith('audio/')) fileType = 'AUDIO';
    else if (fileData.mimetype.startsWith('video/')) fileType = 'VIDEO';
    else if (fileData.mimetype === 'application/pdf') fileType = 'DOCUMENT';

    // 5. SIMPAN KE DATABASE (PERBAIKAN PATH)
    // Di Railway path aslinya "/app/uploads/...", kita ubah jadi "uploads/..."
    // Biar nanti frontend gampang aksesnya: domain.com/uploads/namafile.jpg
    const relativePath = `uploads/${fileData.filename}`;

    const newFile = await prisma.file.create({
      data: {
        originalName: fileData.originalname,
        filename: fileData.filename,
        path: relativePath, // <--- INI YG KITA BENERIN
        mimeType: fileData.mimetype,
        size: fileData.size,
        fileHash: hexHash, 
        type: fileType,
        userId: userId,
        metadata: {} 
      }
    });

    res.status(201).json({
      msg: "Upload Berhasil! File tersimpan aman.",
      data: newFile
    });

  } catch (error) {
    console.error("Upload Error:", error);
    // Hapus file sampah kalau error
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ msg: "Gagal memproses file." });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const userId = req.user.id;
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
