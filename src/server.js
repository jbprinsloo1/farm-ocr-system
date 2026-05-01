require('dotenv').config();
const express = require('express');
const path = require('path');
const scanRoutes = require('./routes/scan');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', scanRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Farm OCR System listening at http://0.0.0.0:${PORT}`);
});
