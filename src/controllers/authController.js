const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "rahasia_negara";

// Konfigurasi Email (Ganti dengan Email & App Password kamu)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mhmdddrzkyyyy@gmail.com', // <--- GANTI EMAIL KAMU
    pass: 'ylte tbkn fzcw dcxr'
  }
});

// === 1. REGISTER ===
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ msg: "User berhasil dibuat", user });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ msg: "Username atau Email sudah terdaftar!" });
    }
    res.status(500).json({ msg: "Gagal register", error });
  }
};

// === 2. LOGIN (UPDATE: Support Username OR Email) ===
const login = async (req, res) => {
  const { username, password } = req.body; // 'username' disini isinya bisa username atau email

  try {
    // Cek di kolom username ATAU kolom email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    if (!user.password) {
      return res.status(400).json({ msg: "Akun ini login via Google, silakan gunakan tombol Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Password salah" });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ msg: "Login sukses", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// === 3. GOOGLE LOGIN ===
const googleAuth = async (req, res) => {
  const { email, username, avatar } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          username,
          avatar,
          password: null
        }
      });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ msg: "Google Login Sukses", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal login Google" });
  }
};

// === 4. FORGOT PASSWORD ===
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ msg: "Email tidak terdaftar" });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 jam

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    const mailOptions = {
      from: 'Vault Memory Admin',
      to: user.email,
      subject: 'Reset Password Vault Memory',
      text: `Klik link ini untuk reset password:\n\n${resetUrl}\n\nAbaikan jika bukan kamu.`
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "Link reset password telah dikirim ke email!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal mengirim email" });
  }
};

// === 5. RESET PASSWORD ===
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() } 
      }
    });

    if (!user) return res.status(400).json({ msg: "Token tidak valid atau expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({ msg: "Password berhasil diubah!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Gagal mereset password" });
  }
};

module.exports = { register, login, googleAuth, forgotPassword, resetPassword };