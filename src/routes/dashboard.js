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

router.get('/', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1wZeoBLAAlK9S6Dl-2PAttNfjN2IbO2jnXrKc7Q29Ycc';
    const range = "'sen wes vrag'!A:I";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const rows = response.data.values || [];
    const dataRows = rows.slice(1);

    let totalLoads = 0;
    let totalWeight = 0;
    let moistureSum = 0;
    let moistureCount = 0;

    const byLand = {};

    dataRows.forEach(row => {
      const land = row[8] || 'Unknown';
      const weight = parseFloat(row[6]) || 0;
      const moisture = parseFloat(row[4]) || 0;

      totalLoads += 1;
      totalWeight += weight;

      if (moisture) {
        moistureSum += moisture;
        moistureCount += 1;
      }

      if (!byLand[land]) {
        byLand[land] = { land, loads: 0, weight: 0 };
      }

      byLand[land].loads += 1;
      byLand[land].weight += weight;
    });

    res.json({
      totalLoads,
      totalWeight: totalWeight.toFixed(3),
      averageMoisture: moistureCount ? (moistureSum / moistureCount).toFixed(2) : '0',
      byLand: Object.values(byLand).sort((a, b) => b.weight - a.weight)
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
