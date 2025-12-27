// File: index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const memoryRoutes = require('./routes/memoryRoutes'); 

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/memories', memoryRoutes); 

app.get('/', (req, res) => {
  res.send('Server Vault-Memory Jalan!');
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});