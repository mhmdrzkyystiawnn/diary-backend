// File: src/controllers/memoryController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Fitur Tambah Diary (Memory)
const addMemory = async (req, res) => {
  try {
    const { fileId, content, mood } = req.body;
    const userId = req.user.id;

    // Pastikan File itu Benar Punya Si User
    const file = await prisma.file.findFirst({
      where: { 
        id: fileId,
        userId: userId 
      }
    });

    if (!file) {
      return res.status(404).json({ msg: "File tidak ditemukan atau bukan milikmu!" });
    }

    // Simpan Memory (Upsert: Update kalau ada, Create kalau belum)
    const memory = await prisma.memory.upsert({
      where: {
        fileId: fileId
      },
      update: {
        content: content,
        mood: mood
      },
      create: {
        fileId: fileId,
        content: content,
        mood: mood
      }
    });

    res.json({ msg: "Memory berhasil disimpan!", data: memory });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal menyimpan memory." });
  }
};

// 2. Fitur Ambil Detail File + Diary + Audio Notes
const getFileDetail = async (req, res) => {
    try {
        const { fileId } = req.params;
        
        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { 
                memory: true, // Sertakan Diary utamanya
                notes: true   // Sertakan Timestamp notes (kalau audio)
            }
        });

        if (!file) {
            return res.status(404).json({ msg: "File tidak ditemukan." });
        }

        res.json({ data: file });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error mengambil data." });
    }
};

// 3. Fitur Tambah Note Detik (Timestamp Note)
const addTimestampNote = async (req, res) => {
  try {
    const { fileId, timestamp, content } = req.body;
    const userId = req.user.id;

    // Cek kepemilikan file lagi (Security)
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId: userId }
    });

    if (!file) {
      return res.status(404).json({ msg: "File tidak ditemukan!" });
    }

    // Simpan Catatan Detik
    const newNote = await prisma.timestampNote.create({
      data: {
        timestamp: parseInt(timestamp), // Pastikan jadi angka
        content: content,
        fileId: fileId
      }
    });

    res.json({ msg: "Note berhasil ditempel di detik ke-" + timestamp, data: newNote });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal menyimpan note." });
  }
};

// 4. Fitur Hapus Note
const deleteTimestampNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        // Hapus langsung
        await prisma.timestampNote.delete({
            where: { id: noteId }
        });
        res.json({ msg: "Note dihapus." });
    } catch (error) {
        res.status(500).json({ msg: "Gagal hapus note." });
    }
};

// === BAGIAN INI YANG TADI ERROR ===
// Pastikan semua fungsi dimasukkan ke dalam kurung kurawal ini
module.exports = { 
    addMemory, 
    getFileDetail, 
    addTimestampNote, 
    deleteTimestampNote 
};