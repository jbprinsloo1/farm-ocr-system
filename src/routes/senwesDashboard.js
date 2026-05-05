const express = require('express');
const router = express.Router();
const { getSheetData } = require('../services/sheets');

const PIN = process.env.SENWES_DASHBOARD_PIN || 'jboom';

function toNumber(v) {
  if (!v) return 0;
  return Number(String(v).replace(',', '.').replace(/[^\d.]/g, '')) || 0;
}

router.get('/', async (req, res) => {
  try {
    if (req.query.pin !== PIN) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const rows = await getSheetData('sen wes vrag');
    const data = rows.slice(1);

    let totalTonnes = 0;
    let moistureSum = 0;
    let moistureCount = 0;

    const byLand = {};
    const byProduct = {};
    const byGrade = {};

    data.forEach(row => {
      const product = row[2] || 'Unknown';
      const moisture = toNumber(row[4]);
      const grade = row[5] || 'Unknown';
      const tonnes = toNumber(row[6]);
      const land = row[8] || 'Unknown';

      totalTonnes += tonnes;

      byLand[land] = (byLand[land] || 0) + tonnes;
      byProduct[product] = (byProduct[product] || 0) + tonnes;
      byGrade[grade] = (byGrade[grade] || 0) + tonnes;

      if (moisture > 0) {
        moistureSum += moisture;
        moistureCount++;
      }
    });

    res.json({
      totalTonnes,
      averageMoisture: moistureCount ? moistureSum / moistureCount : 0,
      byLand: Object.entries(byLand).map(([name, tonnes]) => ({ name, tonnes })),
      byProduct: Object.entries(byProduct).map(([name, tonnes]) => ({ name, tonnes })),
      byGrade: Object.entries(byGrade).map(([name, tonnes]) => ({ name, tonnes }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load Senwes dashboard' });
  }
});

module.exports = router;
