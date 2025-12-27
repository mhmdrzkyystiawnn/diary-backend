// File: src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Ambil token dari Header (Biasanya format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  
  // Kalau gak ada header sama sekali
  if (!authHeader) {
    return res.status(401).json({ msg: "Akses ditolak! Mana tokennya?" });
  }

  // Kita buang kata "Bearer " di depan, ambil kodenya aja
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: "Token format salah!" });
  }

  try {
    // 2. Cek keaslian token pakai kunci rahasia kita
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Kalau asli, simpan data user ke dalam request biar bisa dipakai di Controller
    req.user = decoded; 
    
    // 4. Lanjut ke proses berikutnya (Next)
    next(); 

  } catch (error) {
    res.status(403).json({ msg: "Token tidak valid atau sudah kadaluarsa." });
  }
};

module.exports = verifyToken;