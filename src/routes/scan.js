const express = require('express');
const multer = require('multer');
const path = require('path');
const visionService = require('../services/vision');
const parseVragData = require('../services/parser');
const saveToSheet = require('../services/sheets');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/scan-preview', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const filePath = req.file.path;
    const land = req.body.land || '';

    const rawText = await visionService.extractText(filePath);
    const parsedData = parseVragData(rawText);

    res.json({
      success: true,
      data: {
        ...parsedData,
        land,
        file: req.file.filename
      }
    });
  } catch (error) {
    console.error('Scan preview error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to scan slip'
    });
  }
});

router.post('/save', async (req, res) => {
  try {
    await saveToSheet(req.body);

    res.json({
      success: true,
      message: 'Saved to sheet successfully'
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save data'
    });
  }
});

router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const filePath = req.file.path;
    const land = req.body.land || '';

    const rawText = await visionService.extractText(filePath);
    const parsedData = parseVragData(rawText);

    await saveToSheet({
      ...parsedData,
      land
    });

    res.json({
      success: true,
      data: {
        ...parsedData,
        land
      },
      file: req.file.filename
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process image'
    });
  }
});

module.exports = router;
