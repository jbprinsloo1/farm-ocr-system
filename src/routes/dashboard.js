const express = require('express');
const { google } = require('googleapis');

const router = express.Router();

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const spreadsheetId = '1wZeoBLAAlK9S6Dl-2PAttNfjN2IbO2jnXrKc7Q29Ycc';

async function getSheet(sheets, name) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${name}'!A:Z`
  });

  return res.data.values || [];
}

router.get('/', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const cowId = String(req.query.cowId || '').trim();

    if (!cowId) {
      return res.json({
        ok: true,
        message: 'Provide cowId'
      });
    }

    const inventory = await getSheet(sheets, 'Bees Inventaris');
    const beesPlus = await getSheet(sheets, 'Bees plus');
    const beesMinus = await getSheet(sheets, 'Bees minus');
    const kalfMerk = await getSheet(sheets, 'Kalf merk');

    const inventoryMatches = inventory.filter((row, i) => {
      if (i === 0) return false;
      return String(row.join(' ')).includes(cowId);
    });

    const plusMatches = beesPlus.filter((row, i) => {
      if (i === 0) return false;
      return String(row[2] || '').trim() === cowId;
    });

    const minusMatches = beesMinus.filter((row, i) => {
      if (i === 0) return false;
      return String(row[2] || '').trim() === cowId;
    });

    const kalfMatches = kalfMerk.filter((row, i) => {
      if (i === 0) return false;
      return String(row[1] || '').trim() === cowId;
    });

    res.json({
      ok: true,
      cowId,
      inInventory: inventoryMatches.length > 0,
      inventory: inventoryMatches,
      beesPlus: plusMatches,
      beesMinus: minusMatches,
      kalfMerk: kalfMatches
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
